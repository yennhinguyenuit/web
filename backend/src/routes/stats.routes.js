const express = require("express");
const router = express.Router();
const stats = require("../controllers/stats.controller");

router.get("/revenue", stats.getRevenue);
router.get("/orders", stats.getOrders);
router.get("/summary", stats.getSummary);

module.exports = router;