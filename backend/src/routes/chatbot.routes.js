const express = require("express");
const rateLimit = require("express-rate-limit");
const { chatWithGemini } = require("../controllers/chatbot.controller");
const { optionalAuthenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Qua nhieu tin nhan, vui long thu lai sau",
  },
});

// Optional auth - không bắt buộc đăng nhập
router.post("/", optionalAuthenticate, chatbotLimiter, chatWithGemini);

module.exports = router;
