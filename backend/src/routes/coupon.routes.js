const express = require("express");
const router = express.Router();

const { validateCoupon } = require("../controllers/coupon.controller");

router.post("/validate", validateCoupon);

module.exports = router;
