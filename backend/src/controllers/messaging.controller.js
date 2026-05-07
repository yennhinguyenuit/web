const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");

// Lấy danh sách conversation của user (buyer hoặc seller)
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.query; // "buyer" hoặc "seller" hoặc bỏ trống để lấy cả 2

    let where = {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    };

    if (role === "buyer") {
      where = { buyerId: userId };
    } else if (role === "seller") {
      where = { sellerId: userId };
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Chỉ lấy tin nhắn mới nhất
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return sendSuccess(res, "Lấy danh sách conversation thành công", conversations);
  } catch (error) {
    console.error("Get conversations error:", error.message);
    return sendError(res, "Lỗi khi lấy danh sách conversation", 500);
  }
};

// Lấy chi tiết một conversation (tất cả messages)
const getConversationDetail = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return sendError(res, "Conversation không tồn tại", 404);
    }

    // Kiểm tra quyền truy cập
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      return sendError(res, "Bạn không có quyền truy cập conversation này", 403);
    }

    // Đánh dấu tin nhắn không phải của mình là đã xem
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return sendSuccess(res, "Lấy chi tiết conversation thành công", conversation);
  } catch (error) {
    console.error("Get conversation detail error:", error.message);
    return sendError(res, "Lỗi khi lấy chi tiết conversation", 500);
  }
};

// Tạo conversation mới hoặc lấy conversation cũ
const getOrCreateConversation = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { sellerId, productId, orderId, subject } = req.body;

    if (!sellerId) {
      return sendError(res, "Vui lòng cung cấp sellerId", 400);
    }

    // Kiểm tra seller có tồn tại không
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return sendError(res, "Seller không tồn tại", 404);
    }

    // Tìm conversation cũ với seller + product (nếu có)
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        buyerId_sellerId_productId: {
          buyerId,
          sellerId,
          productId: productId || null,
        },
      },
    });

    if (existingConversation) {
      return sendSuccess(res, "Conversation đã tồn tại", existingConversation);
    }

    // Tạo conversation mới
    const newConversation = await prisma.conversation.create({
      data: {
        buyerId,
        sellerId,
        productId: productId || null,
        orderId: orderId || null,
        subject: subject || null,
      },
    });

    return sendSuccess(res, "Tạo conversation thành công", newConversation, 201);
  } catch (error) {
    console.error("Create conversation error:", error.message);
    return sendError(res, "Lỗi khi tạo conversation", 500);
  }
};

// Gửi tin nhắn
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, content } = req.body;

    if (!conversationId || !content) {
      return sendError(res, "Vui lòng cung cấp conversationId và content", 400);
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return sendError(res, "Nội dung tin nhắn không được trống", 400);
    }

    if (trimmedContent.length > 5000) {
      return sendError(res, "Nội dung tin nhắn quá dài (tối đa 5000 ký tự)", 400);
    }

    // Kiểm tra conversation có tồn tại không
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return sendError(res, "Conversation không tồn tại", 404);
    }

    // Kiểm tra quyền gửi tin nhắn (phải là buyer hoặc seller)
    if (conversation.buyerId !== senderId && conversation.sellerId !== senderId) {
      return sendError(res, "Bạn không có quyền gửi tin nhắn trong conversation này", 403);
    }

    // Tạo message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: trimmedContent,
      },
    });

    // Cập nhật updatedAt của conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return sendSuccess(res, "Gửi tin nhắn thành công", message, 201);
  } catch (error) {
    console.error("Send message error:", error.message);
    return sendError(res, "Lỗi khi gửi tin nhắn", 500);
  }
};

// Lấy tin nhắn chưa đọc
const getUnreadMessages = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await prisma.message.count({
      where: {
        isRead: false,
        conversation: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
        senderId: { not: userId },
      },
    });

    return sendSuccess(res, "Lấy số lượng tin nhắn chưa đọc thành công", {
      unreadCount,
    });
  } catch (error) {
    console.error("Get unread messages error:", error.message);
    return sendError(res, "Lỗi khi lấy số lượng tin nhắn chưa đọc", 500);
  }
};

// Đánh dấu conversation là hoạt động/không hoạt động
const toggleConversationStatus = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const { isActive } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return sendError(res, "Conversation không tồn tại", 404);
    }

    // Kiểm tra quyền
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      return sendError(res, "Bạn không có quyền thay đổi status conversation này", 403);
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { isActive },
    });

    return sendSuccess(res, "Cập nhật trạng thái conversation thành công", updatedConversation);
  } catch (error) {
    console.error("Toggle conversation status error:", error.message);
    return sendError(res, "Lỗi khi cập nhật trạng thái conversation", 500);
  }
};

module.exports = {
  getConversations,
  getConversationDetail,
  getOrCreateConversation,
  sendMessage,
  getUnreadMessages,
  toggleConversationStatus,
};
