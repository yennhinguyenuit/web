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

// Hàm tạo system instruction động dựa trên context
const buildSystemInstruction = (userOrders, products) => {
  // Format thông tin đơn hàng
  const ordersInfo = userOrders && userOrders.length > 0
    ? `\nThông tin đơn hàng của khách:\n${userOrders
        .map(
          (order) =>
            `- Mã đơn: ${order.code}, Trạng thái: ${order.status}, Thanh toán: ${order.paymentStatus}, Ngày: ${new Date(
              order.createdAt
            ).toLocaleDateString("vi-VN")}`
        )
        .join("\n")}`
    : "\nKhách chưa có đơn hàng nào.";

  // Format thông tin sản phẩm
  const productsList = products && products.length > 0
    ? `\nCác sản phẩm của shop:\n${products
        .slice(0, 20) // Giới hạn 20 sản phẩm để không quá dài
        .map(
          (p) =>
            `- ${p.name} (${p.category.name}): ${Number(p.price).toLocaleString(
              "vi-VN"
            )} VND, Rating: ${p.ratingAvg || "Chưa có"}/5`
        )
        .join("\n")}`
    : "";

  return [
    "Bạn là trợ lý chat của website thương mại điện tử Luxe Store.",
    "Trả lời bằng tiếng Việt, ngắn gọn, thân thiện và hữu ích.",
    "Hỗ trợ khách về sản phẩm, giỏ hàng, đặt hàng, thanh toán, vận chuyển, đổi trả.",
    "",
    "THÔNG TIN LIÊN LẠC NGƯỜI BÁN:",
    `- Điện thoại: ${SELLER_INFO.phone}`,
    `- Email: ${SELLER_INFO.email}`,
    "Nếu khách hỏi về phương thức liên lạc, hãy cung cấp thông tin trên.",
    "",
    "THÔNG TIN ĐƠNHÀNG CỦA KHÁCH HÀNG:",
    "Trạng thái đơn hàng:",
    "- pending: Chờ xác nhận",
    "- confirmed: Đã xác nhận",
    "- processing: Đang chuẩn bị",
    "- shipped: Đã gửi",
    "- delivered: Đã giao",
    "- cancelled: Đã hủy",
    ordersInfo,
    "",
    "CÁC SẢN PHẨM CÓ TRÊN SHOP:",
    productsList,
    "",
    "CHÍNH SÁCH:",
    "- Nếu không chắc về giá, tồn kho, chính sách mới nhất hoặc thông tin đơn hàng chi tiết, hãy hướng dẫn khách kiểm tra trên website hoặc liên hệ.",
    "- Tư vấn sản phẩm dựa trên nhu cầu khách, đặc biệt dựa vào lịch sử đơn hàng nếu có.",
    "- Nếu khách hỏi về tính năng của một sản phẩm cụ thể, hãy tư vấn dựa trên thông tin có sẵn.",
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
      const error = new Error("Gemini khong tra ve noi dung phu hop");
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

const chatWithGemini = async (req, res) => {
  try {
    const message = getText(req.body?.message || req.body?.text);

    if (!message) {
      return sendError(res, "Vui long nhap noi dung tin nhan", 400);
    }

    // Lấy thông tin user (có thể null nếu chưa đăng nhập)
    const userId = req.user?.id;

    // Lấy thông tin đơn hàng của user (nếu authenticated)
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
        take: 10, // Lấy 10 đơn hàng gần nhất
      });
    }

    // Lấy danh sách sản phẩm
    const products = await prisma.product.findMany({
      where: { isActive: true, isDeleted: false },
      select: {
        id: true,
        name: true,
        price: true,
        ratingAvg: true,
        category: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Lấy 50 sản phẩm gần nhất
    });

    // Xây dựng system instruction động
    const systemInstruction = buildSystemInstruction(userOrders, products);

    // Gọi Gemini với system instruction mới
    const data = await postToGemini({
      message,
      history: req.body?.history,
      systemInstruction,
    });

    return sendSuccess(res, "Chatbot tra loi thanh cong", data);
  } catch (error) {
    console.error("Chatbot error:", {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    });

    if (error.name === "AbortError") {
      return sendError(res, "Gemini API phan hoi qua lau, vui long thu lai", 504);
    }

    if (error.message === "Missing GEMINI_API_KEY") {
      return sendError(res, "Chua cau hinh GEMINI_API_KEY cho backend", 500);
    }

    return sendError(
      res,
      error.statusCode === 400
        ? error.message
        : "Loi server khi goi Gemini API",
      error.statusCode || 500
    );
  }
};

module.exports = {
  chatWithGemini,
};
