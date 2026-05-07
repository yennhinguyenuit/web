const prisma = require("../config/prisma");
const { verifyToken } = require("../utils/jwt");
const { sendError } = require("../utils/response");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Bạn chưa đăng nhập", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (!user) {
      return sendError(res, "Người dùng không tồn tại", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, "Token không hợp lệ hoặc đã hết hạn", 401);
  }
};

// Optional auth - không yêu cầu token nhưng sẽ parse nếu có
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Không có token - tiếp tục mà không set req.user
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Token lỗi nhưng không cần fail - chỉ log và tiếp tục
    console.log("Optional auth parsing failed:", error.message);
    next();
  }
};

// Default export - backward compatible
module.exports = authMiddleware;

// Named exports
module.exports.authenticate = authMiddleware;
module.exports.optionalAuthenticate = optionalAuthMiddleware;