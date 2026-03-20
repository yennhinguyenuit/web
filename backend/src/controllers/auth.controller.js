const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { generateToken } = require("../utils/jwt");
const { sendSuccess, sendError } = require("../utils/response");

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "Vui lòng nhập đầy đủ tên, email, mật khẩu", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError(res, "Email đã tồn tại", 400);
    }

    const userRole = await prisma.role.findUnique({
      where: { name: "user" },
    });

    if (!userRole) {
      return sendError(res, "Chưa có role user trong database", 500);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash: hashedPassword,
        roleId: userRole.id,
      },
      include: {
        role: true,
      },
    });

    return sendSuccess(
      res,
      "Đăng ký thành công",
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
      },
      201
    );
  } catch (error) {
    console.error("Register error:", error);
    return sendError(res, "Lỗi server khi đăng ký", 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Vui lòng nhập email và mật khẩu", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return sendError(res, "Email hoặc mật khẩu không đúng", 400);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return sendError(res, "Email hoặc mật khẩu không đúng", 400);
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role.name,
    });

    return sendSuccess(res, "Đăng nhập thành công", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, "Lỗi server khi đăng nhập", 500);
  }
};

const me = async (req, res) => {
  try {
    return sendSuccess(res, "Lấy thông tin thành công", {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role.name,
    });
  } catch (error) {
    console.error("Me error:", error);
    return sendError(res, "Lỗi server", 500);
  }
};

module.exports = {
  register,
  login,
  me,
};