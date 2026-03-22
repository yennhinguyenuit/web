const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminDashboard,
} = require("../controllers/admin.controller");

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/dashboard", getAdminDashboard);

router.get("/products", getAdminProducts);
router.post("/products", createProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

router.get("/orders", getAdminOrders);
router.patch("/orders/:id/status", updateOrderStatus);

module.exports = router;