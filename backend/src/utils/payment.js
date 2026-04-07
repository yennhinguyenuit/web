const crypto = require("crypto");
const {
  PAYOS_CODE,
  isPayOSMethod,
  buildPayOSPaymentPayload,
} = require("./payos");

const BANK_TRANSFER_CODE = "bank_transfer";
const DEFAULT_BANK_QR_TEMPLATE = "compact2";
const DEFAULT_BANK_QR_EXPIRE_MINUTES = 15;

const generatePaymentTransactionCode = () => {
  return `PAY-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
};

const buildMockPaymentUrl = ({ transactionCode, orderCode, provider }) => {
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  const params = new URLSearchParams({
    transactionCode,
    orderCode,
    provider,
  });

  return `${frontendUrl}/payment/mock?${params.toString()}`;
};

const sanitizeTransferContent = (value) => {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 48);
};

const normalizeCompareText = (value) => {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toUpperCase();
};

const generateBankTransferContent = ({ orderCode, transactionCode }) => {
  const orderPart = sanitizeTransferContent(orderCode).slice(-14);
  const transactionPart = sanitizeTransferContent(transactionCode).slice(-8);
  const randomPart = crypto.randomBytes(2).toString("hex").toUpperCase();
  return sanitizeTransferContent(`DH${orderPart}${transactionPart}${randomPart}`).slice(0, 30);
};

const getBankTransferConfig = () => {
  const bankId = process.env.BANK_QR_BANK_ID;
  const accountNo = process.env.BANK_QR_ACCOUNT_NO;
  const accountName = process.env.BANK_QR_ACCOUNT_NAME;
  const template = process.env.BANK_QR_TEMPLATE || DEFAULT_BANK_QR_TEMPLATE;
  const expireMinutes = Number(process.env.BANK_QR_EXPIRE_MINUTES || DEFAULT_BANK_QR_EXPIRE_MINUTES);
  const webhookSecureToken =
    process.env.BANK_QR_WEBHOOK_SECURE_TOKEN ||
    process.env.CASSO_WEBHOOK_SECURE_TOKEN ||
    process.env.VIETQR_WEBHOOK_SECURE_TOKEN ||
    "";

  return {
    bankId,
    accountNo,
    accountName,
    template,
    expireMinutes: Number.isFinite(expireMinutes) && expireMinutes > 0 ? expireMinutes : DEFAULT_BANK_QR_EXPIRE_MINUTES,
    webhookSecureToken,
    isConfigured: Boolean(bankId && accountNo && accountName),
  };
};

const buildVietQrQuickLink = ({ bankId, accountNo, accountName, amount, addInfo, template }) => {
  const pathBank = encodeURIComponent(String(bankId).trim());
  const pathAccount = encodeURIComponent(String(accountNo).trim());
  const pathTemplate = encodeURIComponent(template || DEFAULT_BANK_QR_TEMPLATE);
  const params = new URLSearchParams({
    amount: String(Math.round(Number(amount) || 0)),
    addInfo: addInfo || "",
    accountName: accountName || "",
  });

  return `https://img.vietqr.io/image/${pathBank}-${pathAccount}-${pathTemplate}.png?${params.toString()}`;
};

const createBankTransferIntentData = ({ order, transactionCode, amount }) => {
  const config = getBankTransferConfig();
  if (!config.isConfigured) {
    throw new Error("BANK_QR chưa được cấu hình đầy đủ");
  }

  const transferContent = generateBankTransferContent({
    orderCode: order.code,
    transactionCode,
  });

  const qrImageUrl = buildVietQrQuickLink({
    bankId: config.bankId,
    accountNo: config.accountNo,
    accountName: config.accountName,
    amount,
    addInfo: transferContent,
    template: config.template,
  });

  const expiresAt = new Date(Date.now() + config.expireMinutes * 60 * 1000);

  return {
    transferContent,
    qrImageUrl,
    paymentUrl: qrImageUrl,
    qrPayload: JSON.stringify({
      bankId: config.bankId,
      accountNo: config.accountNo,
      accountName: config.accountName,
      amount: Math.round(Number(amount) || 0),
      transferContent,
      template: config.template,
    }),
    expiresAt,
    providerPayload: {
      bankId: config.bankId,
      accountNo: config.accountNo,
      accountName: config.accountName,
      template: config.template,
    },
  };
};

const isBankTransferMethod = (paymentMethodOrCode) => {
  const code = typeof paymentMethodOrCode === "string"
    ? paymentMethodOrCode
    : paymentMethodOrCode?.code;

  return code === BANK_TRANSFER_CODE;
};

const isTransactionExpired = (transaction) => {
  if (!transaction?.expiresAt) return false;
  if (transaction.status !== "pending") return false;
  return new Date(transaction.expiresAt).getTime() <= Date.now();
};

const mapPaymentMethod = (item) => ({
  id: item.id,
  code: item.code,
  name: item.name,
  description: item.description,
  isOnline: item.isOnline,
  isEnabled: item.isEnabled,
  supportsQr: isBankTransferMethod(item) || isPayOSMethod(item),
  autoConfirm: isBankTransferMethod(item) || isPayOSMethod(item),
});

const mapPaymentTransaction = (transaction) => {
  const parsedProviderPayload = transaction.providerPayload && typeof transaction.providerPayload === "string"
    ? (() => {
        try {
          return JSON.parse(transaction.providerPayload);
        } catch (error) {
          return null;
        }
      })()
    : transaction.providerPayload || null;

  return {
    id: transaction.id,
    transactionCode: transaction.transactionCode,
    provider: transaction.provider,
    amount: Number(transaction.amount),
    status: transaction.status,
    paymentUrl: transaction.paymentUrl,
    qrImageUrl: transaction.qrImageUrl,
    transferContent: transaction.transferContent,
    qrPayload: transaction.qrPayload,
    bankReference: transaction.bankReference,
    note: transaction.note,
    expiresAt: transaction.expiresAt,
    isExpired: isTransactionExpired(transaction),
    paidAt: transaction.paidAt,
    failedAt: transaction.failedAt,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
    providerPayload: parsedProviderPayload,
  };
};

const buildBankTransferPaymentPayload = (transaction, order) => {
  const config = getBankTransferConfig();
  const expired = isTransactionExpired(transaction);
  return {
    requiresAction: order.paymentStatus !== "paid" && transaction.status !== "paid",
    provider: BANK_TRANSFER_CODE,
    method: "bank_transfer_qr",
    orderId: order.id,
    orderCode: order.code,
    amount: Number(transaction.amount),
    paymentStatus: order.paymentStatus,
    instructions:
      "Hiển thị mã QR cho khách quét bằng app ngân hàng. Frontend poll endpoint status cho tới khi paymentStatus = paid.",
    bankAccount: {
      bankId: config.bankId,
      accountNo: config.accountNo,
      accountName: config.accountName,
      transferContent: transaction.transferContent,
    },
    qr: {
      imageUrl: transaction.qrImageUrl,
      content: transaction.transferContent,
      expiresAt: transaction.expiresAt,
      isExpired: expired,
    },
    statusEndpoint: `/api/payments/orders/${order.id}/status`,
    transaction: mapPaymentTransaction(transaction),
  };
};

module.exports = {
  BANK_TRANSFER_CODE,
  PAYOS_CODE,
  generatePaymentTransactionCode,
  buildMockPaymentUrl,
  sanitizeTransferContent,
  normalizeCompareText,
  generateBankTransferContent,
  getBankTransferConfig,
  buildVietQrQuickLink,
  createBankTransferIntentData,
  isBankTransferMethod,
  isPayOSMethod,
  isTransactionExpired,
  mapPaymentMethod,
  mapPaymentTransaction,
  buildBankTransferPaymentPayload,
  buildPayOSPaymentPayload,
};
