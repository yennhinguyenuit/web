const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const {
  getOrderPaymentTransactions,
  getOrderPaymentStatus,
  createPaymentIntent,
  handleBankTransferWebhook,
  handlePayOSWebhook,
} = require("../controllers/payment.controller");

router.post("/webhooks/bank-transfer/casso", handleBankTransferWebhook);
router.post("/webhooks/payos", handlePayOSWebhook);

router.use(authMiddleware);

router.get("/orders/:orderId/transactions", getOrderPaymentTransactions);
router.get("/orders/:orderId/status", getOrderPaymentStatus);
router.post("/orders/:orderId/intent", createPaymentIntent);

module.exports = router;
