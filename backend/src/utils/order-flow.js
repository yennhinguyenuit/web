const { createError } = require("./app-error");

const ORDER_STATUSES = ["pending", "confirmed", "shipping", "completed", "cancelled"];
const PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "paid",
  "failed",
  "expired",
  "refunded",
  "cancelled",
];

const COD_PAYMENT_CODE = "cod";

const ALLOWED_STATUS_TRANSITIONS = {
  pending: new Set(["confirmed", "cancelled"]),
  confirmed: new Set(["shipping", "cancelled"]),
  shipping: new Set(["completed"]),
  completed: new Set(),
  cancelled: new Set(),
};

const CUSTOMER_CANCELLABLE_STATUSES = new Set(["pending"]);

const normalizeOrderStatus = (status) => String(status || "").trim().toLowerCase();
const normalizePaymentStatus = (status) => String(status || "").trim().toLowerCase();

const assertPaymentStatus = (status) => {
  if (!PAYMENT_STATUSES.includes(status)) {
    throw createError("Trạng thái thanh toán không hợp lệ", 400);
  }
};

const assertOrderStatus = (status) => {
  if (!ORDER_STATUSES.includes(status)) {
    throw createError("Trạng thái đơn hàng không hợp lệ", 400);
  }
};

const assertOrderTransition = (currentStatus, nextStatus) => {
  assertOrderStatus(nextStatus);

  if (currentStatus === nextStatus) {
    throw createError("Đơn hàng đã ở trạng thái này", 400);
  }

  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] || new Set();
  if (!allowedNextStatuses.has(nextStatus)) {
    throw createError(
      `Không thể chuyển đơn hàng từ "${currentStatus}" sang "${nextStatus}"`,
      400
    );
  }
};

const assertCustomerCanCancelOrder = (order) => {
  const currentStatus = normalizeOrderStatus(order.status);
  const currentPaymentStatus = normalizePaymentStatus(order.paymentStatus);

  if (!CUSTOMER_CANCELLABLE_STATUSES.has(currentStatus)) {
    throw createError("Chỉ có thể hủy đơn khi đơn đang chờ xử lý", 400);
  }

  if (currentPaymentStatus === "paid") {
    throw createError("Đơn đã thanh toán, vui lòng liên hệ shop để được hỗ trợ hủy/hoàn tiền", 400);
  }
};

const buildOrderStatusUpdateData = ({ order, status, paymentStatus }) => {
  const currentStatus = normalizeOrderStatus(order.status);
  const currentPaymentStatus = normalizePaymentStatus(order.paymentStatus);
  const nextStatus = normalizeOrderStatus(status);
  const requestedPaymentStatus =
    paymentStatus !== undefined ? normalizePaymentStatus(paymentStatus) : undefined;

  assertOrderTransition(currentStatus, nextStatus);

  if (requestedPaymentStatus !== undefined) {
    assertPaymentStatus(requestedPaymentStatus);
  }

  const data = { status: nextStatus };

  if (nextStatus === "cancelled") {
    if (currentPaymentStatus === "paid" && requestedPaymentStatus !== "refunded") {
      throw createError("Đơn đã thanh toán cần được đánh dấu hoàn tiền trước khi hủy", 400);
    }

    data.paymentStatus = requestedPaymentStatus || "cancelled";
    return data;
  }

  if (
    nextStatus === "completed" &&
    order.paymentMethod?.code === COD_PAYMENT_CODE &&
    currentPaymentStatus !== "paid" &&
    requestedPaymentStatus === undefined
  ) {
    data.paymentStatus = "paid";
  }

  if (requestedPaymentStatus !== undefined) {
    data.paymentStatus = requestedPaymentStatus;
  }

  return data;
};

const applyOrderCancellationSideEffects = async (tx, order, actorLabel) => {
  for (const item of order.items || []) {
    await tx.product.updateMany({
      where: { id: item.productId },
      data: {
        stock: {
          increment: item.quantity,
        },
      },
    });
  }

  if (order.couponId) {
    const deletedUsage = await tx.couponUsage.deleteMany({
      where: { orderId: order.id },
    });

    if (deletedUsage.count > 0) {
      await tx.coupon.updateMany({
        where: {
          id: order.couponId,
          usedCount: { gt: 0 },
        },
        data: {
          usedCount: {
            decrement: 1,
          },
        },
      });
    }
  }

  await tx.paymentTransaction.updateMany({
    where: {
      orderId: order.id,
      status: "pending",
    },
    data: {
      status: "cancelled",
      failedAt: new Date(),
      note: `Đơn hàng đã bị hủy bởi ${actorLabel}`,
    },
  });
};

module.exports = {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  ALLOWED_STATUS_TRANSITIONS,
  COD_PAYMENT_CODE,
  normalizeOrderStatus,
  normalizePaymentStatus,
  assertPaymentStatus,
  assertCustomerCanCancelOrder,
  buildOrderStatusUpdateData,
  applyOrderCancellationSideEffects,
};
