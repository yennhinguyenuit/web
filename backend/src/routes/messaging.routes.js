const express = require("express");
const {
  getConversations,
  getConversationDetail,
  getOrCreateConversation,
  sendMessage,
  getUnreadMessages,
  toggleConversationStatus,
} = require("../controllers/messaging.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Tất cả routes đều yêu cầu xác thực
router.use(authMiddleware);

// Lấy danh sách conversation
router.get("/conversations", getConversations);

// Lấy số lượng tin nhắn chưa đọc
router.get("/unread-count", getUnreadMessages);

// Tạo hoặc lấy conversation cũ
router.post("/conversations", getOrCreateConversation);

// Lấy chi tiết conversation (tất cả messages)
router.get("/conversations/:conversationId", getConversationDetail);

// Gửi tin nhắn
router.post("/messages", sendMessage);

// Đánh dấu conversation hoạt động/không hoạt động
router.patch("/conversations/:conversationId/status", toggleConversationStatus);

module.exports = router;
