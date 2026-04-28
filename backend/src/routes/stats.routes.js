const express = require("express");
const router = express.Router();

const {
  getSummary,
  getRevenue,
  getOrders,
  getTopProducts, // ✅ thêm
} = require("../controllers/stats.controller");

router.get("/summary", getSummary);
router.get("/revenue", getRevenue);
router.get("/orders", getOrders);
router.get("/top-products", getTopProducts); // ✅ thêm

module.exports = router;