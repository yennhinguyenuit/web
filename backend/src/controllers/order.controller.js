const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");

const generateOrderCode = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const generateTrackingNumber = () => {
  return `TRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const formatOrderListItem = (order) => {
  return {
    id: order.id,
    code: order.code,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    discount: Number(order.discount),
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod
      ? {
          id: order.paymentMethod.id,
          code: order.paymentMethod.code,
          name: order.paymentMethod.name,
        }
      : null,
    shippingMethod: order.shippingMethod
      ? {
          id: order.shippingMethod.id,
          code: order.shippingMethod.code,
          name: order.shippingMethod.name,
        }
      : null,
    itemCount: order.items.length,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
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
    status: order.status,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber,
    paymentMethod: order.paymentMethod
      ? {
          id: order.paymentMethod.id,
          code: order.paymentMethod.code,
          name: order.paymentMethod.name,
        }
      : null,
    shippingMethod: order.shippingMethod
      ? {
          id: order.shippingMethod.id,
          code: order.shippingMethod.code,
          name: order.shippingMethod.name,
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
          isDefault: order.address.isDefault,
        }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      color: item.color,
      size: item.size,
      subTotal: Number(item.unitPrice) * item.quantity,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

const createOrder = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      city,
      district,
      ward,
      shippingMethodCode,
      paymentMethodCode,
    } = req.body;

    if (
      !name ||
      !phone ||
      !address ||
      !city ||
      !district ||
      !ward ||
      !shippingMethodCode ||
      !paymentMethodCode
    ) {
      return sendError(
        res,
        "Vui lòng nhập đầy đủ thông tin giao hàng và phương thức thanh toán",
        400
      );
    }

    const cart = await prisma.cart.findUnique({
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
      return sendError(res, "Giỏ hàng đang trống", 400);
    }

    const shippingMethod = await prisma.shippingMethod.findUnique({
      where: { code: shippingMethodCode },
    });

    if (!shippingMethod) {
      return sendError(res, "Phương thức vận chuyển không hợp lệ", 400);
    }

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { code: paymentMethodCode },
    });

    if (!paymentMethod) {
      return sendError(res, "Phương thức thanh toán không hợp lệ", 400);
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0
    );
    const shippingFee = Number(shippingMethod.price);
    const discount = 0;
    const total = subtotal + shippingFee - discount;

    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new Error(`Sản phẩm không tồn tại: ${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Sản phẩm "${product.name}" không đủ tồn kho`);
        }
      }

      const createdAddress = await tx.address.create({
        data: {
          userId: req.user.id,
          name,
          phone,
          address,
          city,
          district,
          ward,
          isDefault: false,
        },
      });

      const createdOrder = await tx.order.create({
        data: {
          code: generateOrderCode(),
          userId: req.user.id,
          addressId: createdAddress.id,
          shippingMethodId: shippingMethod.id,
          paymentMethodId: paymentMethod.id,
          subtotal,
          shippingFee,
          discount,
          total,
          status: "pending",
          paymentStatus: paymentMethod.code === "cod" ? "unpaid" : "pending",
          trackingNumber: generateTrackingNumber(),
        },
      });

      for (const item of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: item.productId,
            productName: product.name,
            productImage: product.image,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
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
          items: true,
        },
      });
    });

    return sendSuccess(res, "Tạo đơn hàng thành công", formatOrderDetail(order), 201);
  } catch (error) {
    console.error("Create order error:", error);
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
        items: true,
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