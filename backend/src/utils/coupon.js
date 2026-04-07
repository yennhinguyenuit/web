const { createError } = require("./app-error");

const roundCurrency = (value) => {
  return Number((Math.round((Number(value) + Number.EPSILON) * 100) / 100).toFixed(2));
};

const normalizeCoupon = (coupon) => {
  if (!coupon) return null;

  return {
    id: coupon.id,
    code: coupon.code,
    name: coupon.name,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    minOrderValue: Number(coupon.minOrderValue),
    maxDiscount: coupon.maxDiscount !== null && coupon.maxDiscount !== undefined
      ? Number(coupon.maxDiscount)
      : null,
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount,
    perUserLimit: coupon.perUserLimit,
    startAt: coupon.startAt,
    endAt: coupon.endAt,
    isActive: coupon.isActive,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  };
};

const calculateCouponDiscount = (coupon, subtotal) => {
  const normalizedCoupon = normalizeCoupon(coupon);
  const normalizedSubtotal = roundCurrency(subtotal);

  if (!normalizedCoupon) {
    return 0;
  }

  let discount = 0;

  if (normalizedCoupon.discountType === "percent") {
    discount = normalizedSubtotal * (normalizedCoupon.discountValue / 100);
  } else if (normalizedCoupon.discountType === "fixed") {
    discount = normalizedCoupon.discountValue;
  } else {
    throw createError("Loại mã giảm giá không hợp lệ", 400);
  }

  if (normalizedCoupon.maxDiscount !== null) {
    discount = Math.min(discount, normalizedCoupon.maxDiscount);
  }

  discount = Math.min(discount, normalizedSubtotal);

  return roundCurrency(discount);
};

const validateCouponForCheckout = async ({ prisma, couponCode, userId, subtotal }) => {
  if (!couponCode) {
    return {
      coupon: null,
      discount: 0,
    };
  }

  const normalizedCode = String(couponCode).trim().toUpperCase();
  if (!normalizedCode) {
    return {
      coupon: null,
      discount: 0,
    };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
  });

  if (!coupon || !coupon.isActive) {
    throw createError("Mã giảm giá không tồn tại hoặc đã bị vô hiệu", 400);
  }

  const now = new Date();
  if (coupon.startAt && coupon.startAt > now) {
    throw createError("Mã giảm giá chưa đến thời gian sử dụng", 400);
  }

  if (coupon.endAt && coupon.endAt < now) {
    throw createError("Mã giảm giá đã hết hạn", 400);
  }

  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    throw createError("Mã giảm giá đã hết lượt sử dụng", 400);
  }

  const normalizedSubtotal = roundCurrency(subtotal);
  if (normalizedSubtotal < Number(coupon.minOrderValue)) {
    throw createError(
      `Đơn hàng cần tối thiểu ${Number(coupon.minOrderValue).toLocaleString("vi-VN")}đ để áp dụng mã này`,
      400
    );
  }

  if (coupon.perUserLimit !== null && coupon.perUserLimit !== undefined) {
    const usedCountByUser = await prisma.couponUsage.count({
      where: {
        couponId: coupon.id,
        userId,
      },
    });

    if (usedCountByUser >= coupon.perUserLimit) {
      throw createError("Bạn đã sử dụng hết lượt cho mã giảm giá này", 400);
    }
  }

  return {
    coupon,
    discount: calculateCouponDiscount(coupon, normalizedSubtotal),
  };
};

module.exports = {
  roundCurrency,
  normalizeCoupon,
  calculateCouponDiscount,
  validateCouponForCheckout,
};
