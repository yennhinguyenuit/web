const crypto = require("crypto");
const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");
const { createError, isAppError } = require("../utils/app-error");
const { validateCouponForCheckout } = require("../utils/coupon");
const {
  BANK_TRANSFER_CODE,
  generatePaymentTransactionCode,
  mapPaymentTransaction,
  mapPaymentMethod,
  createBankTransferIntentData,
  isBankTransferMethod,
  isPayOSMethod,
  buildBankTransferPaymentPayload,
  buildPayOSPaymentPayload,
} = require("../utils/payment");

const generateOrderCode = () => {
  return `ORD-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
};

const formatOrderListItem = (order) => {
  return {
    id: order.id,
    code: order.code,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    discount: Number(order.discount),
    couponCode: order.couponCode,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod ? mapPaymentMethod(order.paymentMethod) : null,
    shippingMethod: order.shippingMethod
      ? {
          id: order.shippingMethod.id,
          code: order.shippingMethod.code,
          name: order.shippingMethod.name,
        }
      : null,
    itemCount: order.items.length,
    latestTransaction: order.transactions?.[0]
      ? mapPaymentTransaction(order.transactions[0])
      : null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

const buildOrderPaymentInfo = (order) => {
  const latestTransaction = order.transactions?.[0] || null;

  if (!order.paymentMethod?.isOnline) {
    return {
      requiresAction: false,
      latestTransaction: latestTransaction ? mapPaymentTransaction(latestTransaction) : null,
    };
  }

  if (isBankTransferMethod(order.paymentMethod) && latestTransaction) {
    return buildBankTransferPaymentPayload(latestTransaction, order);
  }

  if (isPayOSMethod(order.paymentMethod) && latestTransaction) {
    return buildPayOSPaymentPayload(latestTransaction, order);
  }

  return {
    requiresAction: order.paymentStatus !== "paid",
    latestTransaction: latestTransaction ? mapPaymentTransaction(latestTransaction) : null,
  };
};

const formatOrderDetail = (order) => {
  return {
    id: order.id,
    code: order.code,
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    discount: Number(order.discount),
    total: Number(order.total),
    coupon: order.coupon
      ? {
          id: order.coupon.id,
          code: order.coupon.code,
          name: order.coupon.name,
        }
      : order.couponCode
        ? { code: order.couponCode }
        : null,
    status: order.status,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber,
    paymentMethod: order.paymentMethod ? mapPaymentMethod(order.paymentMethod) : null,
    shippingMethod: order.shippingMethod
      ? {
          id: order.shippingMethod.id,
          code: order.shippingMethod.code,
          name: order.shippingMethod.name,
          price: Number(order.shippingMethod.price),
          estimatedDays: order.shippingMethod.estimatedDays,
        }
      : null,
    shippingAddress: order.address
      ? {
          id: order.address.id,
          name: order.address.name,
          phone: order.address.phone,
          address: order.address.address,
          city: order.address.city,
          district: order.address.district,
          ward: order.address.ward,
        }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      color: item.color || null,
      size: item.size || null,
      subTotal: Number(item.unitPrice) * item.quantity,
    })),
    payment: buildOrderPaymentInfo(order),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

const normalizeShippingAddress = (shippingAddress) => {
  if (!shippingAddress) return null;

  const finalAddressData = {
    name: shippingAddress.name,
    phone: shippingAddress.phone,
    address: shippingAddress.address,
    city: shippingAddress.city,
    district: shippingAddress.district,
    ward: shippingAddress.ward,
  };

  for (const [key, value] of Object.entries(finalAddressData)) {
    if (!value || !String(value).trim()) {
      throw createError("Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng", 400, { field: key });
    }

    finalAddressData[key] = String(value).trim();
  }

  return finalAddressData;
};

const buildOnlineTransactionData = ({ paymentMethod, order, total }) => {
  if (!paymentMethod.isOnline) {
    return null;
  }

  if (isPayOSMethod(paymentMethod)) {
    return null;
  }

  if (!isBankTransferMethod(paymentMethod)) {
    throw createError(
      "Phương thức thanh toán này hiện chưa được hỗ trợ.",
      400
    );
  }

  const transactionCode = generatePaymentTransactionCode();
  const intent = createBankTransferIntentData({
    order,
    transactionCode,
    amount: total,
  });

  return {
    transactionCode,
    provider: BANK_TRANSFER_CODE,
    amount: total,
    status: "pending",
    paymentUrl: intent.paymentUrl,
    qrImageUrl: intent.qrImageUrl,
    qrPayload: intent.qrPayload,
    transferContent: intent.transferContent,
    expiresAt: intent.expiresAt,
    note: "Tạo giao dịch thanh toán cùng lúc với đơn hàng",
    providerPayload: intent.providerPayload,
  };
};

const createOrder = async (req, res) => {
  try {
    const {
      addressId,
      shippingAddress,
      saveAddress,
      shippingMethodCode,
      paymentMethodCode,
      couponCode,
    } = req.body;

    if (!shippingMethodCode || !paymentMethodCode) {
      return sendError(
        res,
        "Thiếu phương thức giao hàng hoặc phương thức thanh toán",
        400
      );
    }

    if (!addressId && !shippingAddress) {
      return sendError(
        res,
        "Vui lòng chọn địa chỉ đã lưu hoặc nhập địa chỉ giao hàng mới",
        400
      );
    }

    const [shippingMethod, paymentMethod] = await Promise.all([
      prisma.shippingMethod.findUnique({
        where: { code: shippingMethodCode },
      }),
      prisma.paymentMethod.findUnique({
        where: { code: paymentMethodCode },
      }),
    ]);

    if (!shippingMethod) {
      return sendError(res, "Phương thức vận chuyển không hợp lệ", 400);
    }

    if (!paymentMethod || !paymentMethod.isEnabled) {
      return sendError(res, "Phương thức thanh toán không hợp lệ", 400);
    }

    let finalAddressData;

    if (addressId) {
      const existingAddress = await prisma.address.findFirst({
        where: {
          id: addressId,
          userId: req.user.id,
        },
      });

      if (!existingAddress) {
        return sendError(res, "Địa chỉ không tồn tại", 404);
      }

      finalAddressData = {
        name: existingAddress.name,
        phone: existingAddress.phone,
        address: existingAddress.address,
        city: existingAddress.city,
        district: existingAddress.district,
        ward: existingAddress.ward,
      };
    } else {
      finalAddressData = normalizeShippingAddress(shippingAddress);
    }

    const shippingFee = Number(shippingMethod.price);

    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId: req.user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw createError("Giỏ hàng đang trống", 400);
      }

      const subtotal = cart.items.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0
      );

      const { coupon, discount } = await validateCouponForCheckout({
        prisma: tx,
        couponCode,
        userId: req.user.id,
        subtotal,
      });

      const total = subtotal + shippingFee - discount;

      const createdOrderAddress = await tx.orderAddress.create({
        data: finalAddressData,
      });

      if (!addressId && saveAddress === true) {
        const addressCount = await tx.address.count({
          where: { userId: req.user.id },
        });

        await tx.address.create({
          data: {
            userId: req.user.id,
            ...finalAddressData,
            isDefault: addressCount === 0,
          },
        });
      }

      for (const item of cart.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            isActive: true,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count === 0) {
          throw createError(
            `Sản phẩm "${item.product.name}" không đủ tồn kho hoặc đã bị ẩn`,
            400
          );
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          code: generateOrderCode(),
          userId: req.user.id,
          addressId: createdOrderAddress.id,
          shippingMethodId: shippingMethod.id,
          paymentMethodId: paymentMethod.id,
          couponId: coupon?.id || null,
          couponCode: coupon?.code || null,
          subtotal,
          shippingFee,
          discount,
          total,
          status: "pending",
          paymentStatus: paymentMethod.isOnline ? "pending" : "unpaid",
          trackingNumber: null,
        },
      });

      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: item.productId,
            productName: item.product.name,
            productImage: item.product.image,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            color: item.color || null,
            size: item.size || null,
          },
        });
      }

      if (coupon) {
        const usedCountByUser = await tx.couponUsage.count({
          where: {
            couponId: coupon.id,
            userId: req.user.id,
          },
        });

        if (coupon.perUserLimit && usedCountByUser >= coupon.perUserLimit) {
          throw createError("Bạn đã sử dụng hết lượt cho mã giảm giá này", 400);
        }

        const updatedCoupon = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            ...(coupon.usageLimit !== null && coupon.usageLimit !== undefined
              ? { usedCount: { lt: coupon.usageLimit } }
              : {}),
          },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });

        if (updatedCoupon.count === 0) {
          throw createError("Mã giảm giá đã hết lượt sử dụng", 400);
        }

        await tx.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId: req.user.id,
            orderId: createdOrder.id,
          },
        });
      }

      const onlineTransactionData = buildOnlineTransactionData({
        paymentMethod,
        order: createdOrder,
        total,
      });

      if (onlineTransactionData) {
        await tx.paymentTransaction.create({
          data: {
            orderId: createdOrder.id,
            paymentMethodId: paymentMethod.id,
            ...onlineTransactionData,
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return tx.order.findUnique({
        where: { id: createdOrder.id },
        include: {
          address: true,
          paymentMethod: true,
          shippingMethod: true,
          coupon: true,
          items: true,
          transactions: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    });

    return sendSuccess(
      res,
      "Tạo đơn hàng thành công",
      formatOrderDetail(order),
      201
    );
  } catch (error) {
    console.error("Create order error:", error);
    if (isAppError(error)) {
      return sendError(res, error.message, error.statusCode);
    }
    return sendError(res, error.message || "Lỗi server khi tạo đơn hàng", 500);
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        items: true,
        paymentMethod: true,
        shippingMethod: true,
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sendSuccess(
      res,
      "Lấy danh sách đơn hàng thành công",
      orders.map(formatOrderListItem)
    );
  } catch (error) {
    console.error("Get my orders error:", error);
    return sendError(res, "Lỗi server khi lấy danh sách đơn hàng", 500);
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        address: true,
        paymentMethod: true,
        shippingMethod: true,
        coupon: true,
        items: true,
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return sendError(res, "Không tìm thấy đơn hàng", 404);
    }

    return sendSuccess(
      res,
      "Lấy chi tiết đơn hàng thành công",
      formatOrderDetail(order)
    );
  } catch (error) {
    console.error("Get order detail error:", error);
    return sendError(res, "Lỗi server khi lấy chi tiết đơn hàng", 500);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetail,
};
