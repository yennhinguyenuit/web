const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  createOrder,
  getMyOrders,
  getOrderDetail,
  cancelOrder,
  updateOrderStatus,
} = require("../controllers/order.controller");

router.use(authMiddleware);

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderDetail);
router.patch("/:id/cancel", cancelOrder);
router.patch("/:id/status", roleMiddleware("admin"), updateOrderStatus);

module.exports = router;