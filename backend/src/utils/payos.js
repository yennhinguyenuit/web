const crypto = require("crypto");

const PAYOS_CODE = "payos";
const DEFAULT_PAYOS_EXPIRE_MINUTES = 15;
const DEFAULT_PAYOS_RETURN_PATH = "/payment/result";
const DEFAULT_PAYOS_CANCEL_PATH = "/payment/result";
const DEFAULT_PAYOS_API_BASE_URL = process.env.PAYOS_API_BASE_URL || "https://api-merchant.payos.vn";

const isPayOSMethod = (paymentMethodOrCode) => {
  const code = typeof paymentMethodOrCode === "string"
    ? paymentMethodOrCode
    : paymentMethodOrCode?.code;

  return code === PAYOS_CODE;
};

const getPayOSConfig = () => {
  const clientId = process.env.PAYOS_CLIENT_ID || "";
  const apiKey = process.env.PAYOS_API_KEY || "";
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY || "";
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  const returnPath = process.env.PAYOS_RETURN_PATH || DEFAULT_PAYOS_RETURN_PATH;
  const cancelPath = process.env.PAYOS_CANCEL_PATH || DEFAULT_PAYOS_CANCEL_PATH;
  const expireMinutes = Number(process.env.PAYOS_EXPIRE_MINUTES || DEFAULT_PAYOS_EXPIRE_MINUTES);

  return {
    clientId,
    apiKey,
    checksumKey,
    frontendUrl,
    returnPath,
    cancelPath,
    expireMinutes: Number.isFinite(expireMinutes) && expireMinutes > 0
      ? expireMinutes
      : DEFAULT_PAYOS_EXPIRE_MINUTES,
    apiBaseUrl: DEFAULT_PAYOS_API_BASE_URL.replace(/\/$/, ""),
    isConfigured: Boolean(clientId && apiKey && checksumKey),
  };
};

const sortObjectByKey = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => (
      item && typeof item === "object" && !Array.isArray(item)
        ? sortObjectByKey(item)
        : item
    ));
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObjectByKey(value[key]);
        return result;
      }, {});
  }

  return value;
};

const convertObjectToQueryString = (object) => {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) => {
      let value = object[key];

      if (Array.isArray(value)) {
        value = JSON.stringify(value.map((item) => (
          item && typeof item === "object" && !Array.isArray(item)
            ? sortObjectByKey(item)
            : item
        )));
      } else if (value && typeof value === "object") {
        value = JSON.stringify(sortObjectByKey(value));
      }

      if ([null, undefined, "undefined", "null", "NULL"].includes(value)) {
        value = "";
      }

      return `${key}=${value}`;
    })
    .join("&");
};

const createPayOSSignature = (data, checksumKey) => {
  const sortedData = sortObjectByKey(data);
  const rawString = convertObjectToQueryString(sortedData);

  return crypto
    .createHmac("sha256", checksumKey)
    .update(rawString)
    .digest("hex");
};

const buildFrontendUrl = (path, params = {}) => {
  const { frontendUrl } = getPayOSConfig();
  const finalPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${frontendUrl}${finalPath}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

const createPayOSMerchantOrderCode = () => {
  const now = Date.now();
  const suffix = Math.floor(Math.random() * 900) + 100;
  return Number(`${String(now).slice(-10)}${suffix}`);
};

const createPayOSDescription = (order) => {
  const base = String(order.code || order.id || "DONHANG")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  const description = `THANH TOAN ${base}`.trim();
  return description.slice(0, 25) || "THANH TOAN DON HANG";
};

const requestPayOS = async ({ path, method = "GET", body }) => {
  const config = getPayOSConfig();

  if (!config.isConfigured) {
    throw new Error("payOS chưa được cấu hình đầy đủ");
  }

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-client-id": config.clientId,
      "x-api-key": config.apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || !json || json.code !== "00") {
    const message = json?.desc || json?.message || `payOS trả về HTTP ${response.status}`;
    throw new Error(message);
  }

  return json.data;
};

const createPayOSPaymentLink = async ({ order, items, amount }) => {
  const config = getPayOSConfig();
  if (!config.isConfigured) {
    throw new Error("payOS chưa được cấu hình đầy đủ");
  }

  const merchantOrderCode = createPayOSMerchantOrderCode();
  const returnUrl = buildFrontendUrl(config.returnPath, {
    orderId: order.id,
    source: PAYOS_CODE,
  });
  const cancelUrl = buildFrontendUrl(config.cancelPath, {
    orderId: order.id,
    source: PAYOS_CODE,
  });
  const expiredAt = Math.floor(Date.now() / 1000) + config.expireMinutes * 60;
  const normalizedAmount = Math.round(Number(amount) || 0);
  const description = createPayOSDescription(order);

  const payload = {
    orderCode: merchantOrderCode,
    amount: normalizedAmount,
    description,
    items: Array.isArray(items) && items.length > 0
      ? items.map((item) => ({
          name: String(item.name || item.productName || "San pham")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9 ]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 25) || "San pham",
          quantity: Number(item.quantity || 1),
          price: Math.round(Number(item.price || item.unitPrice || 0)),
        }))
      : [
          {
            name: `DON HANG ${String(order.code || "").slice(-10)}`.trim().slice(0, 25),
            quantity: 1,
            price: normalizedAmount,
          },
        ],
    cancelUrl,
    returnUrl,
    expiredAt,
  };

  const signature = createPayOSSignature({
    amount: payload.amount,
    cancelUrl: payload.cancelUrl,
    description: payload.description,
    orderCode: payload.orderCode,
    returnUrl: payload.returnUrl,
  }, config.checksumKey);

  const paymentLink = await requestPayOS({
    path: "/v2/payment-requests",
    method: "POST",
    body: {
      ...payload,
      signature,
    },
  });

  return {
    merchantOrderCode,
    paymentLink,
    expiredAt: new Date(expiredAt * 1000),
  };
};

const getPayOSPaymentLink = async (identifier) => {
  return requestPayOS({
    path: `/v2/payment-requests/${encodeURIComponent(String(identifier))}`,
    method: "GET",
  });
};

const verifyPayOSWebhookSignature = (payload) => {
  const config = getPayOSConfig();
  if (!config.isConfigured) {
    throw new Error("payOS chưa được cấu hình đầy đủ");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Payload webhook payOS không hợp lệ");
  }

  if (!payload.signature) {
    throw new Error("Webhook payOS thiếu chữ ký");
  }

  if (!payload.data || typeof payload.data !== "object") {
    throw new Error("Webhook payOS thiếu dữ liệu giao dịch");
  }

  const computedSignature = createPayOSSignature(payload.data, config.checksumKey);
  if (computedSignature.toLowerCase() !== String(payload.signature).toLowerCase()) {
    throw new Error("Chữ ký webhook payOS không hợp lệ");
  }

  return payload;
};

const buildPayOSPaymentPayload = (transaction, order) => {
  const providerPayload = transaction.providerPayload && typeof transaction.providerPayload === "object"
    ? transaction.providerPayload
    : null;

  return {
    requiresAction: order.paymentStatus !== "paid" && transaction.status !== "paid",
    provider: PAYOS_CODE,
    method: "payos_hosted_page",
    orderId: order.id,
    orderCode: order.code,
    amount: Number(transaction.amount),
    paymentStatus: order.paymentStatus,
    instructions:
      "Mở trang thanh toán PayOS để khách quét QR hoặc thanh toán trực tuyến. Khi giao dịch hoàn tất, hệ thống sẽ tự cập nhật trạng thái đơn hàng.",
    checkout: {
      url: transaction.paymentUrl,
      qrCode: transaction.qrPayload,
      paymentLinkId: providerPayload?.paymentLinkId || null,
      merchantOrderCode: providerPayload?.merchantOrderCode || transaction.transferContent || null,
      status: providerPayload?.status || transaction.status,
      expiresAt: transaction.expiresAt,
    },
    statusEndpoint: `/api/payments/orders/${order.id}/status`,
    transaction: {
      id: transaction.id,
      transactionCode: transaction.transactionCode,
      provider: transaction.provider,
      amount: Number(transaction.amount),
      status: transaction.status,
      paymentUrl: transaction.paymentUrl,
      qrPayload: transaction.qrPayload,
      transferContent: transaction.transferContent,
      bankReference: transaction.bankReference,
      note: transaction.note,
      expiresAt: transaction.expiresAt,
      paidAt: transaction.paidAt,
      failedAt: transaction.failedAt,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      providerPayload,
    },
  };
};

module.exports = {
  PAYOS_CODE,
  getPayOSConfig,
  isPayOSMethod,
  createPayOSSignature,
  createPayOSPaymentLink,
  getPayOSPaymentLink,
  verifyPayOSWebhookSignature,
  buildPayOSPaymentPayload,
};
