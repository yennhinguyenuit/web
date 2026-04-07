const prisma = require("../config/prisma");
const { sendSuccess, sendError } = require("../utils/response");
const { createError, isAppError } = require("../utils/app-error");
const {
  BANK_TRANSFER_CODE,
  PAYOS_CODE,
  getBankTransferConfig,
  createBankTransferIntentData,
  isBankTransferMethod,
  isPayOSMethod,
  isTransactionExpired,
  mapPaymentMethod,
  mapPaymentTransaction,
  generatePaymentTransactionCode,
  buildBankTransferPaymentPayload,
  buildPayOSPaymentPayload,
  normalizeCompareText,
} = require("../utils/payment");
const {
  getPayOSConfig,
  createPayOSPaymentLink,
  getPayOSPaymentLink,
  verifyPayOSWebhookSignature,
} = require("../utils/payos");

const getPaymentMethods = async (req, res) => {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: { isEnabled: true },
      orderBy: { createdAt: "asc" },
    });

    const bankConfig = getBankTransferConfig();
    const payOSConfig = getPayOSConfig();

    return sendSuccess(
      res,
      "Lấy phương thức thanh toán thành công",
      methods.map((method) => ({
        ...mapPaymentMethod(method),
        isConfigured: isBankTransferMethod(method)
          ? bankConfig.isConfigured
          : isPayOSMethod(method)
            ? payOSConfig.isConfigured
            : true,
      }))
    );
  } catch (error) {
    console.error("Get payment methods error:", error);
    return sendError(res, "Lỗi server khi lấy phương thức thanh toán", 500);
  }
};

const getOrderPaymentTransactions = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id,
      },
      include: {
        paymentMethod: true,
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return sendError(res, "Không tìm thấy đơn hàng", 404);
    }

    return sendSuccess(res, "Lấy lịch sử thanh toán thành công", {
      orderId: order.id,
      orderCode: order.code,
      paymentMethod: order.paymentMethod ? mapPaymentMethod(order.paymentMethod) : null,
      paymentStatus: order.paymentStatus,
      transactions: order.transactions.map(mapPaymentTransaction),
    });
  } catch (error) {
    console.error("Get order payment transactions error:", error);
    return sendError(res, "Lỗi server khi lấy lịch sử thanh toán", 500);
  }
};

const ensureBankTransferConfigured = () => {
  const config = getBankTransferConfig();

  if (!config.isConfigured) {
    throw createError(
      "Thanh toán chuyển khoản chưa được cấu hình. Hãy thiết lập BANK_QR_BANK_ID, BANK_QR_ACCOUNT_NO, BANK_QR_ACCOUNT_NAME trong env.",
      500
    );
  }

  return config;
};

const ensurePayOSConfigured = () => {
  const config = getPayOSConfig();

  if (!config.isConfigured) {
    throw createError(
      "payOS chưa được cấu hình. Hãy thiết lập PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY trong env.",
      500
    );
  }

  return config;
};

const createBankTransferTransaction = async ({ order }) => {
  ensureBankTransferConfigured();

  const transactionCode = generatePaymentTransactionCode();
  const intent = createBankTransferIntentData({
    order,
    transactionCode,
    amount: order.total,
  });

  return prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      paymentMethodId: order.paymentMethodId,
      transactionCode,
      provider: BANK_TRANSFER_CODE,
      amount: order.total,
      status: "pending",
      paymentUrl: intent.paymentUrl,
      qrImageUrl: intent.qrImageUrl,
      qrPayload: intent.qrPayload,
      transferContent: intent.transferContent,
      expiresAt: intent.expiresAt,
      note: "Chờ khách quét VietQR và chuyển khoản ngân hàng",
      providerPayload: intent.providerPayload,
    },
  });
};

const createPayOSTransaction = async ({ order }) => {
  ensurePayOSConfigured();

  const transactionCode = generatePaymentTransactionCode();
  const { merchantOrderCode, paymentLink, expiredAt } = await createPayOSPaymentLink({
    order,
    items: order.items,
    amount: order.total,
  });

  return prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      paymentMethodId: order.paymentMethodId,
      transactionCode,
      provider: PAYOS_CODE,
      amount: order.total,
      status: "pending",
      paymentUrl: paymentLink.checkoutUrl,
      qrPayload: paymentLink.qrCode || null,
      transferContent: String(merchantOrderCode),
      expiresAt: expiredAt,
      note: "Đã tạo link thanh toán payOS",
      providerPayload: {
        merchantOrderCode,
        paymentLinkId: paymentLink.paymentLinkId,
        status: paymentLink.status,
        bin: paymentLink.bin,
        accountNumber: paymentLink.accountNumber,
        accountName: paymentLink.accountName,
        checkoutUrl: paymentLink.checkoutUrl,
      },
    },
  });
};

const syncPayOSTransactionIfNeeded = async ({ order }) => {
  const latestTransaction = order.transactions?.[0] || null;

  if (!latestTransaction || !isPayOSMethod(order.paymentMethod)) {
    return order;
  }

  if (order.paymentStatus === "paid" || latestTransaction.status === "paid") {
    return order;
  }

  const providerPayload = latestTransaction.providerPayload || {};
  const identifier =
    providerPayload.paymentLinkId ||
    providerPayload.merchantOrderCode ||
    latestTransaction.transferContent;

  if (!identifier) {
    return order;
  }

  try {
    const paymentLink = await getPayOSPaymentLink(identifier);
    const remoteStatus = String(paymentLink.status || "").toUpperCase();
    const amountPaid = Number(paymentLink.amountPaid || 0);
    const amount = Math.round(Number(latestTransaction.amount));
    const isPaid = remoteStatus === "PAID" || amountPaid >= amount;
    const isCancelled = remoteStatus === "CANCELLED";

    await prisma.paymentTransaction.update({
      where: { id: latestTransaction.id },
      data: {
        status: isPaid ? "paid" : isCancelled ? "cancelled" : latestTransaction.status,
        paidAt: isPaid ? latestTransaction.paidAt || new Date() : latestTransaction.paidAt,
        failedAt: isCancelled ? latestTransaction.failedAt || new Date() : latestTransaction.failedAt,
        note: isPaid
          ? "payOS xác nhận đơn đã thanh toán"
          : isCancelled
            ? "Link thanh toán payOS đã bị hủy"
            : latestTransaction.note,
        providerPayload: {
          ...providerPayload,
          paymentLinkId: paymentLink.id || providerPayload.paymentLinkId || null,
          merchantOrderCode: paymentLink.orderCode || providerPayload.merchantOrderCode || null,
          status: remoteStatus || providerPayload.status || null,
          amountPaid,
          amountRemaining: paymentLink.amountRemaining,
          transactions: paymentLink.transactions || [],
        },
      },
    });

    if (isPaid) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "paid" },
      });
    }

    return prisma.order.findFirst({
      where: {
        id: order.id,
        userId: order.userId,
      },
      include: {
        paymentMethod: true,
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  } catch (error) {
    console.error("Sync payOS status error:", error);
    return order;
  }
};

const getOrderPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    let order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id,
      },
      include: {
        paymentMethod: true,
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!order) {
      return sendError(res, "Không tìm thấy đơn hàng", 404);
    }

    order = await syncPayOSTransactionIfNeeded({ order });

    const latestTransaction = order.transactions[0] || null;

    return sendSuccess(res, "Lấy trạng thái thanh toán thành công", {
      orderId: order.id,
      orderCode: order.code,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod ? mapPaymentMethod(order.paymentMethod) : null,
      latestTransaction: latestTransaction ? mapPaymentTransaction(latestTransaction) : null,
      payment:
        latestTransaction && isPayOSMethod(order.paymentMethod)
          ? buildPayOSPaymentPayload(latestTransaction, order)
          : latestTransaction && isBankTransferMethod(order.paymentMethod)
            ? buildBankTransferPaymentPayload(latestTransaction, order)
            : null,
    });
  } catch (error) {
    console.error("Get order payment status error:", error);
    return sendError(res, "Lỗi server khi lấy trạng thái thanh toán", 500);
  }
};

const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id,
      },
      include: {
        paymentMethod: true,
        items: true,
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return sendError(res, "Không tìm thấy đơn hàng", 404);
    }

    if (!order.paymentMethod?.isEnabled) {
      return sendError(res, "Phương thức thanh toán hiện không khả dụng", 400);
    }

    if (!order.paymentMethod?.isOnline) {
      return sendError(res, "Đơn hàng COD không cần tạo payment intent", 400);
    }

    if (order.paymentStatus === "paid") {
      return sendError(res, "Đơn hàng đã được thanh toán", 400);
    }

    if (!isBankTransferMethod(order.paymentMethod) && !isPayOSMethod(order.paymentMethod)) {
      return sendError(
        res,
        "Hiện backend chỉ bật thanh toán payOS hoặc quét QR chuyển khoản ngân hàng.",
        400
      );
    }

    const reusableTransaction = order.transactions.find(
      (transaction) => transaction.status === "pending" && !isTransactionExpired(transaction)
    );

    if (reusableTransaction) {
      return sendSuccess(
        res,
        "Sử dụng lại payment intent đang chờ xử lý",
        isPayOSMethod(order.paymentMethod)
          ? buildPayOSPaymentPayload(reusableTransaction, order)
          : buildBankTransferPaymentPayload(reusableTransaction, order)
      );
    }

    const expiredTransactionIds = order.transactions
      .filter((transaction) => transaction.status === "pending" && isTransactionExpired(transaction))
      .map((transaction) => transaction.id);

    if (expiredTransactionIds.length > 0) {
      await prisma.paymentTransaction.updateMany({
        where: { id: { in: expiredTransactionIds } },
        data: {
          status: "expired",
          note: "Payment intent cũ đã hết hạn, yêu cầu tạo mới",
        },
      });
    }

    const createdTransaction = isPayOSMethod(order.paymentMethod)
      ? await createPayOSTransaction({ order })
      : await createBankTransferTransaction({ order });

    return sendSuccess(
      res,
      "Tạo payment intent thành công",
      isPayOSMethod(order.paymentMethod)
        ? buildPayOSPaymentPayload(createdTransaction, order)
        : buildBankTransferPaymentPayload(createdTransaction, order),
      201
    );
  } catch (error) {
    console.error("Create payment intent error:", error);
    if (isAppError(error)) {
      return sendError(res, error.message, error.statusCode);
    }
    return sendError(res, error.message || "Lỗi server khi tạo payment intent", 500);
  }
};

const normalizeWebhookTransactions = (payload) => {
  if (!payload || Number(payload.error) !== 0 || !payload.data) {
    return [];
  }

  const transactions = Array.isArray(payload.data) ? payload.data : [payload.data];

  return transactions.map((item) => ({
    reference: item.reference || item.tid || item.id || null,
    description: item.description || "",
    amount: Number(item.amount || 0),
    transactionDateTime: item.transactionDateTime || item.when || null,
    sourceBankName: item.bankName || item.bankAbbreviation || null,
    counterAccountName: item.counterAccountName || item.corresponsiveName || null,
    counterAccountNumber: item.counterAccountNumber || item.corresponsiveAccount || null,
    raw: item,
  }));
};

const verifyWebhookSecurity = (req) => {
  const configuredToken = getBankTransferConfig().webhookSecureToken;

  if (!configuredToken) {
    if (process.env.NODE_ENV === "production") {
      throw createError("Webhook thanh toán chưa được cấu hình secure token", 500);
    }

    return;
  }

  const incomingToken = req.headers["secure-token"];

  if (!incomingToken || incomingToken !== configuredToken) {
    throw createError("Webhook token không hợp lệ", 401);
  }
};

const processIncomingBankTransfer = async (incoming) => {
  const normalizedDescription = normalizeCompareText(incoming.description);
  if (!normalizedDescription || !incoming.amount) {
    return null;
  }

  if (incoming.reference) {
    const existedByReference = await prisma.paymentTransaction.findFirst({
      where: {
        provider: BANK_TRANSFER_CODE,
        bankReference: String(incoming.reference),
      },
      include: {
        order: true,
      },
    });

    if (existedByReference) {
      return existedByReference;
    }
  }

  const pendingTransactions = await prisma.paymentTransaction.findMany({
    where: {
      provider: BANK_TRANSFER_CODE,
      status: "pending",
      transferContent: { not: null },
      order: {
        paymentStatus: { not: "paid" },
      },
    },
    include: {
      order: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const matchedTransaction = pendingTransactions.find((transaction) => {
    const expectedContent = normalizeCompareText(transaction.transferContent);
    if (!expectedContent) return false;

    const expectedAmount = Math.round(Number(transaction.amount));
    const receivedAmount = Math.round(Number(incoming.amount));

    return normalizedDescription.includes(expectedContent) && expectedAmount === receivedAmount;
  });

  if (!matchedTransaction) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    const currentTransaction = await tx.paymentTransaction.findUnique({
      where: { id: matchedTransaction.id },
      include: { order: true },
    });

    if (!currentTransaction) {
      return null;
    }

    if (currentTransaction.status === "paid" || currentTransaction.order.paymentStatus === "paid") {
      return currentTransaction;
    }

    const updatedTransaction = await tx.paymentTransaction.update({
      where: { id: currentTransaction.id },
      data: {
        status: "paid",
        paidAt: incoming.transactionDateTime ? new Date(incoming.transactionDateTime) : new Date(),
        failedAt: null,
        bankReference: incoming.reference ? String(incoming.reference) : currentTransaction.bankReference,
        note: `Đã nhận tiền qua webhook ngân hàng${incoming.counterAccountName ? ` từ ${incoming.counterAccountName}` : ""}`,
        providerPayload: incoming.raw,
      },
    });

    await tx.order.update({
      where: { id: currentTransaction.orderId },
      data: {
        paymentStatus: "paid",
      },
    });

    return updatedTransaction;
  });
};

const handleBankTransferWebhook = async (req, res) => {
  try {
    verifyWebhookSecurity(req);

    const incomingTransactions = normalizeWebhookTransactions(req.body);
    if (incomingTransactions.length === 0) {
      return res.status(200).json({ success: true, message: "Webhook hợp lệ nhưng không có giao dịch mới", data: [] });
    }

    const processed = [];

    for (const incoming of incomingTransactions) {
      const matchedTransaction = await processIncomingBankTransfer(incoming);
      if (matchedTransaction) {
        processed.push(matchedTransaction.transactionCode);
      }
    }

    return res.status(200).json({
      success: true,
      message: processed.length > 0 ? "Đã đối soát thanh toán thành công" : "Không khớp giao dịch nào",
      data: {
        processedCount: processed.length,
        transactionCodes: processed,
      },
    });
  } catch (error) {
    console.error("Handle bank transfer webhook error:", error);

    if (isAppError(error)) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý webhook thanh toán",
    });
  }
};

const processIncomingPayOSPayment = async (data) => {
  const merchantOrderCode = data?.orderCode ? String(data.orderCode) : null;
  if (!merchantOrderCode) {
    return null;
  }

  const transaction = await prisma.paymentTransaction.findFirst({
    where: {
      provider: PAYOS_CODE,
      transferContent: merchantOrderCode,
    },
    include: {
      order: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!transaction) {
    return null;
  }

  if (transaction.status === "paid" || transaction.order.paymentStatus === "paid") {
    return transaction;
  }

  return prisma.$transaction(async (tx) => {
    const updatedTransaction = await tx.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "paid",
        paidAt: data.transactionDateTime ? new Date(data.transactionDateTime) : new Date(),
        failedAt: null,
        bankReference: data.reference ? String(data.reference) : transaction.bankReference,
        note: `payOS xác nhận thanh toán${data.counterAccountName ? ` từ ${data.counterAccountName}` : ""}`,
        providerPayload: {
          ...(transaction.providerPayload || {}),
          paymentLinkId: data.paymentLinkId || null,
          merchantOrderCode,
          status: "PAID",
          rawWebhook: data,
        },
      },
    });

    await tx.order.update({
      where: { id: transaction.orderId },
      data: {
        paymentStatus: "paid",
      },
    });

    return updatedTransaction;
  });
};

const handlePayOSWebhook = async (req, res) => {
  try {
    const verifiedPayload = verifyPayOSWebhookSignature(req.body);

    if (!verifiedPayload.success || verifiedPayload.code !== "00" || verifiedPayload.data?.code !== "00") {
      return res.status(200).json({
        success: true,
        message: "Webhook payOS hợp lệ nhưng không phải giao dịch thành công",
      });
    }

    const updatedTransaction = await processIncomingPayOSPayment(verifiedPayload.data);

    return res.status(200).json({
      success: true,
      message: updatedTransaction ? "Đã cập nhật đơn hàng từ webhook payOS" : "Không tìm thấy giao dịch payOS tương ứng",
      data: updatedTransaction ? { transactionCode: updatedTransaction.transactionCode } : null,
    });
  } catch (error) {
    console.error("Handle payOS webhook error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Webhook payOS không hợp lệ",
    });
  }
};

module.exports = {
  getPaymentMethods,
  getOrderPaymentTransactions,
  getOrderPaymentStatus,
  createPaymentIntent,
  handleBankTransferWebhook,
  handlePayOSWebhook,
};
