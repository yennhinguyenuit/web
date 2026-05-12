const { sendSuccess, sendError } = require("../utils/response");
const prisma = require("../config/prisma");

// Import fetch for Node.js < 18
let fetch;
if (typeof global.fetch === "undefined") {
  try {
    fetch = require("node-fetch");
  } catch {
    console.error("node-fetch not installed. Run: npm install node-fetch");
    fetch = global.fetch;
  }
} else {
  fetch = global.fetch;
}

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 12;
const REQUEST_TIMEOUT_MS = 20000;

// THÔNG TIN LIÊN LẠC SELLER
const SELLER_INFO = {
  phone: "0975771727",
  email: "luxestore@gmail.com",
};

// 🔥 Hàm lấy sản phẩm chi tiết (kèm ảnh, size, màu sắc)
const getDetailedProducts = async () => {
  return await prisma.product.findMany({
    where: { isActive: true, isDeleted: false },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      originalPrice: true,
      description: true,
      ratingAvg: true,
      reviewCount: true,
      badge: true,
      stock: true,
      image: true,
      category: {
        select: { name: true, slug: true },
      },
      images: {
        select: { imageUrl: true },
        take: 3,
      },
      colors: {
        select: { colorName: true },
      },
      sizes: {
        select: { sizeName: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

// 🔥 Hàm tạo system instruction tối ưu cho recommendation
const buildSystemInstruction = (userOrders, products) => {
  // Format thông tin đơn hàng
  const ordersInfo = userOrders && userOrders.length > 0
    ? `\nThông tin đơn hàng của khách:\n${userOrders
        .map(
          (order) =>
            `- Mã: ${order.code}, Trạng thái: ${order.status}, Thanh toán: ${order.paymentStatus}, Giá: ${order.total.toLocaleString(
              "vi-VN"
            )} VND, Ngày: ${new Date(order.createdAt).toLocaleDateString("vi-VN")}`
        )
        .join("\n")}`
    : "\nKhách chưa có đơn hàng nào.";

  // Format thông tin sản phẩm chi tiết
  const productsList = products && products.length > 0
    ? `\nCác sản phẩm của shop:\n${products
        .slice(0, 15) // Giới hạn 15 sản phẩm
        .map(
          (p) => {
            const colors = p.colors?.map(c => c.colorName).join(", ") || "Không rõ";
            const sizes = p.sizes?.map(s => s.sizeName).join(", ") || "Không rõ";
            return `- ${p.name} | Giá: ${Number(p.price).toLocaleString("vi-VN")} VND | Màu: ${colors} | Size: ${sizes} | Rating: ${p.ratingAvg}/5 (${p.reviewCount} reviews) | Tồn kho: ${p.stock}`;
          }
        )
        .join("\n")}`
    : "";

  return [
    "=== LUXE STORE CHATBOT ===",
    "Bạn là trợ lý chat của Luxe Store - cửa hàng thời trang trực tuyến.",
    "Trả lời bằng tiếng Việt, thân thiện, hữu ích, ngắn gọn (tối đa 150 từ).",
    "",
    "NHIỆM VỤ CHÍNH:",
    "1. Gợi ý sản phẩm phù hợp với nhu cầu khách (dựa trên category, giá, size, màu sắc)",
    "2. Hỗ trợ về tình trạng đơn hàng, thanh toán, vận chuyển",
    "3. Trả lời câu hỏi về sản phẩm (chất liệu, kích cỡ, màu sắc)",
    "4. Cung cấp thông tin liên lạc khi cần",
    "",
    "THÔNG TIN LIÊN LẠC:",
    `- Điện thoại: ${SELLER_INFO.phone}`,
    `- Email: ${SELLER_INFO.email}`,
    "",
    "HƯỚNG DẪN GỢIY Ý SẢN PHẨM:",
    "- Nếu khách hỏi về sản phẩm, hãy gợi ý 2-3 sản phẩm phù hợp nhất",
    "- Nêu rõ: tên, giá, màu sắc có sẵn, size, rating",
    "- Thêm: 'Bấm vào để xem chi tiết' hoặc 'Thêm vào giỏ hàng'",
    "",
    "TRẠNG THÁI ĐƠN HÀNG:",
    "- pending: Chờ xác nhận",
    "- confirmed: Đã xác nhận",
    "- processing: Đang chuẩn bị hàng",
    "- shipped: Đã gửi hàng",
    "- delivered: Đã giao thành công",
    "- cancelled: Đã hủy",
    ordersInfo,
    "",
    "CÁC SẢN PHẨM HIỆN CÓ:",
    productsList,
    "",
    "CHÚ Ý:",
    "- Nếu không chắc về tồn kho, giá, chính sách, hãy hướng dẫn kiểm tra website",
    "- Nếu khách muốn liên lạc trực tiếp, cung cấp SĐT hoặc email ở trên",
    "- Hành động 'gợi ý sản phẩm' không cần chờ phản hồi, hãy tự động đề xuất",
  ].join(" ");
};

const getText = (value) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_MESSAGE_LENGTH);
};

const normalizeHistory = (history) => {
  if (!Array.isArray(history)) return [];

  const normalized = history
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => {
      const text = getText(item?.text || item?.content || item?.message);
      if (!text) return null;

      const role =
        item?.role === "model" || item?.sender === "bot" ? "model" : "user";

      return {
        role,
        parts: [{ text }],
      };
    })
    .filter(Boolean);

  while (normalized.length && normalized[0].role !== "user") {
    normalized.shift();
  }

  return normalized;
};

const extractGeminiReply = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => part?.text)
    .filter(Boolean)
    .join("\n")
    .trim();
};

const postToGemini = async ({ message, history, systemInstruction }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    const error = new Error("Missing GEMINI_API_KEY");
    error.statusCode = 500;
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const contents = [
    ...normalizeHistory(history),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 512,
          },
        }),
        signal: controller.signal,
      }
    );

    const raw = await response.text();
    const data = raw ? JSON.parse(raw) : null;

    if (!response.ok) {
      const error = new Error(data?.error?.message || "Gemini API error");
      error.statusCode = response.status >= 500 ? 502 : 400;
      error.details = data?.error || null;
      throw error;
    }

    const reply = extractGeminiReply(data);

    if (!reply) {
      const error = new Error("Gemini không trả về nội dung phù hợp");
      error.statusCode = 502;
      error.details = data?.promptFeedback || data?.candidates?.[0] || null;
      throw error;
    }

    return {
      reply,
      model,
      finishReason: data?.candidates?.[0]?.finishReason || null,
      usage: data?.usageMetadata || null,
    };
  } finally {
    clearTimeout(timeout);
  }
};

// 🎯 Hàm để parse product recommendations từ Gemini reply
const extractProductRecommendations = (reply, allProducts) => {
  const recommendations = [];
  
  // Tìm tên sản phẩm trong reply
  allProducts.forEach((product) => {
    if (reply.toLowerCase().includes(product.name.toLowerCase())) {
      // Nếu sản phẩm được đề cập, thêm vào recommendations
      recommendations.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        image: product.image,
        images: product.images?.map(img => img.imageUrl) || [],
        ratingAvg: product.ratingAvg,
        reviewCount: product.reviewCount,
        badge: product.badge,
        stock: product.stock,
        category: product.category?.name,
        colors: product.colors?.map(c => c.colorName) || [],
        sizes: product.sizes?.map(s => s.sizeName) || [],
      });
    }
  });

  return recommendations.slice(0, 3); // Tối đa 3 gợi ý
};

// 🎯 Hàm tạo quick suggestions cho đơn hàng
const generateOrderQuickSuggestions = (userOrders) => {
  if (!userOrders || userOrders.length === 0) {
    return [
      "🛍️ Tôi muốn xem những sản phẩm mới",
      "👕 Bạn có áo thun nào không?",
      "💰 Sản phẩm nào giá dưới 500k?",
    ];
  }

  const suggestions = [];
  const lastOrder = userOrders[0];

  // Gợi ý dựa trên trạng thái đơn hàng
  if (lastOrder.status === "pending" || lastOrder.status === "confirmed") {
    suggestions.push(`📦 Kiểm tra đơn hàng ${lastOrder.code}`);
    suggestions.push("❌ Tôi muốn hủy đơn hàng");
  }

  if (lastOrder.status === "shipped" || lastOrder.status === "delivered") {
    suggestions.push(`✅ Xác nhận đã nhận đơn ${lastOrder.code}`);
    suggestions.push("⭐ Đánh giá sản phẩm");
  }

  suggestions.push("🛍️ Xem sản phẩm tương tự");
  suggestions.push("📞 Liên hệ với shop");

  return suggestions.slice(0, 3);
};

const chatWithGemini = async (req, res) => {
  try {
    const message = getText(req.body?.message || req.body?.text);

    if (!message) {
      return sendError(res, "Vui lòng nhập nội dung tin nhắn", 400);
    }

    // Lấy thông tin user
    const userId = req.user?.id;

    // Lấy thông tin đơn hàng
    let userOrders = [];
    if (userId) {
      userOrders = await prisma.order.findMany({
        where: { userId },
        select: {
          id: true,
          code: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
    }

    // Lấy danh sách sản phẩm chi tiết
    const products = await getDetailedProducts();

    // Xây dựng system instruction
    const systemInstruction = buildSystemInstruction(userOrders, products);

    // Gọi Gemini
    const geminiResponse = await postToGemini({
      message,
      history: req.body?.history,
      systemInstruction,
    });

    // Parse product recommendations từ reply
    const recommendations = extractProductRecommendations(geminiResponse.reply, products);

    // Tạo quick suggestions
    const quickSuggestions = generateOrderQuickSuggestions(userOrders);

    return sendSuccess(res, "Chatbot trả lời thành công", {
      reply: geminiResponse.reply,
      recommendations, // Sản phẩm được gợi ý
      quickSuggestions, // Gợi ý câu hỏi tiếp theo
      model: geminiResponse.model,
      usage: geminiResponse.usage,
    });
  } catch (error) {
    console.error("Chatbot error:", {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    });

    if (error.name === "AbortError") {
      return sendError(res, "Gemini API phản hồi quá lâu, vui lòng thử lại", 504);
    }

    if (error.message === "Missing GEMINI_API_KEY") {
      return sendError(res, "Chưa cấu hình GEMINI_API_KEY", 500);
    }

    return sendError(
      res,
      error.statusCode === 400
        ? error.message
        : "Lỗi server khi gọi Gemini API",
      error.statusCode || 500
    );
  }
};

module.exports = {
  chatWithGemini,
};
