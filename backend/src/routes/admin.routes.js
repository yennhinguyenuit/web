const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  getDashboard,
  getAdminProducts,
  createProduct,
  updateProduct,
  toggleProductVisibility,
  deleteProduct,
  getAdminOrders,
  getAdminCustomers,
  updateOrderStatus,
} = require("../controllers/admin.controller");
const {
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupon.controller");

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/dashboard", getDashboard);

router.get("/products", getAdminProducts);
router.post("/products", createProduct);
router.patch("/products/:id", updateProduct);
router.patch("/products/:id/visibility", toggleProductVisibility);
router.delete("/products/:id", deleteProduct);

router.get("/orders", getAdminOrders);
router.get("/customers", getAdminCustomers);
router.patch("/orders/:id/status", updateOrderStatus);

router.get("/coupons", getAdminCoupons);
router.post("/coupons", createCoupon);
router.patch("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);

module.exports = router;