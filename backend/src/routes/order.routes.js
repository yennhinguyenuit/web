const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const {
  createOrder,
  getMyOrders,
  getOrderDetail,
  cancelOrder,
} = require("../controllers/order.controller");

router.use(authMiddleware);

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderDetail);
router.patch('/:id/status', cancelOrder);

module.exports = router;