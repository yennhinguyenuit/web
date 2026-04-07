const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const {
  register,
  login,
  me,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Bạn thử đăng nhập/đăng ký quá nhiều lần, vui lòng thử lại sau",
  },
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", authMiddleware, me);

module.exports = router;
