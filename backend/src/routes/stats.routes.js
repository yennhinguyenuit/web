const express = require("express");
const router = express.Router();

const {
  getSummary,
  getRevenue,
  getRevenueByWeek,
  getOrders,
  getTopProducts,
} = require("../controllers/stats.controller");

router.get("/summary", getSummary);
router.get("/revenue", getRevenue);
router.get("/revenue-by-week", getRevenueByWeek);
router.get("/orders", getOrders);
router.get("/top-products", getTopProducts);

module.exports = router;