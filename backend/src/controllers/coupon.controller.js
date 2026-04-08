const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");
const { createError, isAppError } = require("../utils/app-error");
const { normalizeCoupon, validateCouponForCheckout } = require("../utils/coupon");

const parseOptionalAmount = (value, fieldName) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw createError(`${fieldName} không hợp lệ`, 400);
  }

  return parsed;
};

const parseOptionalInteger = (value, fieldName) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw createError(`${fieldName} không hợp lệ`, 400);
  }

  return parsed;
};

const parseOptionalDate = (value, fieldName) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    throw createError(`${fieldName} không hợp lệ`, 400);
  }

  return parsedDate;
};

const mapCoupon = (coupon) => normalizeCoupon(coupon);

const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return sendError(res, "Vui lòng nhập mã giảm giá", 400);
    }

    const parsedSubtotal = Number(subtotal);
    if (Number.isNaN(parsedSubtotal) || parsedSubtotal < 0) {
      return sendError(res, "Subtotal không hợp lệ", 400);
    }

    const { coupon, discount } = await validateCouponForCheckout({
      prisma,
      couponCode: code,
      userId: req.user.id,
      subtotal: parsedSubtotal,
    });

    return sendSuccess(res, "Áp dụng mã giảm giá thành công", {
      coupon: mapCoupon(coupon),
      discount,
      subtotal: parsedSubtotal,
      finalSubtotal: parsedSubtotal - discount,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    if (isAppError(error)) {
      return sendError(res, error.message, error.statusCode);
    }
    return sendError(res, "Lỗi server khi kiểm tra mã giảm giá", 500);
  }
};

const getAdminCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });

    return sendSuccess(res, "Lấy danh sách coupon thành công", coupons.map(mapCoupon));
  } catch (error) {
    console.error("Get admin coupons error:", error);
    return sendError(res, "Lỗi server khi lấy coupon", 500);
  }
};

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      perUserLimit,
      startAt,
      endAt,
      isActive,
    } = req.body;

    if (!code || !name || !discountType || discountValue === undefined || discountValue === null) {
      return sendError(res, "Thiếu các trường bắt buộc của coupon", 400);
    }

    const normalizedCode = String(code).trim().toUpperCase();
    if (!normalizedCode) {
      return sendError(res, "Mã coupon không hợp lệ", 400);
    }

    if (!["percent", "fixed"].includes(discountType)) {
      return sendError(res, "discountType chỉ nhận percent hoặc fixed", 400);
    }

    const parsedDiscountValue = parseOptionalAmount(discountValue, "discountValue");
    const parsedMinOrderValue = parseOptionalAmount(minOrderValue, "minOrderValue") ?? 0;
    const parsedMaxDiscount = parseOptionalAmount(maxDiscount, "maxDiscount");
    const parsedUsageLimit = parseOptionalInteger(usageLimit, "usageLimit");
    const parsedPerUserLimit = parseOptionalInteger(perUserLimit, "perUserLimit");
    const parsedStartAt = parseOptionalDate(startAt, "startAt");
    const parsedEndAt = parseOptionalDate(endAt, "endAt");

    if (parsedDiscountValue === null || parsedDiscountValue <= 0) {
      return sendError(res, "discountValue phải lớn hơn 0", 400);
    }

    if (discountType === "percent" && parsedDiscountValue > 100) {
      return sendError(res, "Coupon phần trăm không được vượt quá 100", 400);
    }

    if (parsedStartAt && parsedEndAt && parsedStartAt > parsedEndAt) {
      return sendError(res, "Khoảng thời gian coupon không hợp lệ", 400);
    }

    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (existingCoupon) {
      return sendError(res, "Mã coupon đã tồn tại", 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: normalizedCode,
        name,
        description: description || null,
        discountType,
        discountValue: parsedDiscountValue,
        minOrderValue: parsedMinOrderValue,
        maxDiscount: parsedMaxDiscount,
        usageLimit: parsedUsageLimit,
        perUserLimit: parsedPerUserLimit,
        startAt: parsedStartAt,
        endAt: parsedEndAt,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    return sendSuccess(res, "Tạo coupon thành công", mapCoupon(coupon), 201);
  } catch (error) {
    console.error("Create coupon error:", error);
    if (isAppError(error)) {
      return sendError(res, error.message, error.statusCode);
    }
    return sendError(res, "Lỗi server khi tạo coupon", 500);
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return sendError(res, "Không tìm thấy coupon", 404);
    }

    const updateData = {};

    if (req.body.code !== undefined) {
      const normalizedCode = String(req.body.code).trim().toUpperCase();
      if (!normalizedCode) {
        return sendError(res, "Mã coupon không hợp lệ", 400);
      }

      const duplicated = await prisma.coupon.findFirst({
        where: {
          code: normalizedCode,
          id: { not: id },
        },
      });

      if (duplicated) {
        return sendError(res, "Mã coupon đã tồn tại", 400);
      }

      updateData.code = normalizedCode;
    }

    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description || null;

    if (req.body.discountType !== undefined) {
      if (!["percent", "fixed"].includes(req.body.discountType)) {
        return sendError(res, "discountType chỉ nhận percent hoặc fixed", 400);
      }
      updateData.discountType = req.body.discountType;
    }

    const parsedDiscountValue = parseOptionalAmount(req.body.discountValue, "discountValue");
    if (parsedDiscountValue !== undefined) {
      if (parsedDiscountValue === null || parsedDiscountValue <= 0) {
        return sendError(res, "discountValue phải lớn hơn 0", 400);
      }
      updateData.discountValue = parsedDiscountValue;
    }

    const nextDiscountType = updateData.discountType || existingCoupon.discountType;
    const nextDiscountValue = updateData.discountValue ?? Number(existingCoupon.discountValue);
    if (nextDiscountType === "percent" && nextDiscountValue > 100) {
      return sendError(res, "Coupon phần trăm không được vượt quá 100", 400);
    }

    const parsedMinOrderValue = parseOptionalAmount(req.body.minOrderValue, "minOrderValue");
    if (parsedMinOrderValue !== undefined) updateData.minOrderValue = parsedMinOrderValue ?? 0;

    const parsedMaxDiscount = parseOptionalAmount(req.body.maxDiscount, "maxDiscount");
    if (parsedMaxDiscount !== undefined) updateData.maxDiscount = parsedMaxDiscount;

    const parsedUsageLimit = parseOptionalInteger(req.body.usageLimit, "usageLimit");
    if (parsedUsageLimit !== undefined) updateData.usageLimit = parsedUsageLimit;

    const parsedPerUserLimit = parseOptionalInteger(req.body.perUserLimit, "perUserLimit");
    if (parsedPerUserLimit !== undefined) updateData.perUserLimit = parsedPerUserLimit;

    const parsedStartAt = parseOptionalDate(req.body.startAt, "startAt");
    if (parsedStartAt !== undefined) updateData.startAt = parsedStartAt;

    const parsedEndAt = parseOptionalDate(req.body.endAt, "endAt");
    if (parsedEndAt !== undefined) updateData.endAt = parsedEndAt;

    const nextStartAt = updateData.startAt !== undefined ? updateData.startAt : existingCoupon.startAt;
    const nextEndAt = updateData.endAt !== undefined ? updateData.endAt : existingCoupon.endAt;
    if (nextStartAt && nextEndAt && nextStartAt > nextEndAt) {
      return sendError(res, "Khoảng thời gian coupon không hợp lệ", 400);
    }

    if (req.body.isActive !== undefined) {
      updateData.isActive = Boolean(req.body.isActive);
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return sendSuccess(res, "Cập nhật coupon thành công", mapCoupon(updatedCoupon));
  } catch (error) {
    console.error("Update coupon error:", error);
    if (isAppError(error)) {
      return sendError(res, error.message, error.statusCode);
    }
    return sendError(res, "Lỗi server khi cập nhật coupon", 500);
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return sendError(res, "Không tìm thấy coupon", 404);
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });

    return sendSuccess(res, "Đã vô hiệu hóa coupon", mapCoupon(coupon));
  } catch (error) {
    console.error("Delete coupon error:", error);
    return sendError(res, "Lỗi server khi xóa coupon", 500);
  }
};

module.exports = {
  validateCoupon,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
