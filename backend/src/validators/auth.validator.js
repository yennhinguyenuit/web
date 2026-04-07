const { z } = require("zod");

const optionalPhone = z
  .string()
  .trim()
  .min(8, "Số điện thoại phải có ít nhất 8 ký tự")
  .max(15, "Số điện thoại không được vượt quá 15 ký tự")
  .optional()
  .or(z.literal(""));

const registerSchema = z.object({
  name: z.string().trim().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().trim().toLowerCase().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  phone: optionalPhone,
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
