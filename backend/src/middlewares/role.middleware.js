const { sendError } = require("../utils/response");

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(res, "Không xác định được quyền người dùng", 403);
    }

    if (!roles.includes(req.user.role.name)) {
      return sendError(res, "Bạn không có quyền truy cập", 403);
    }

    next();
  };
};

module.exports = roleMiddleware;