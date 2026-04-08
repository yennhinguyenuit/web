const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const { validateCoupon } = require("../controllers/coupon.controller");

router.use(authMiddleware);

router.post("/validate", validateCoupon);

module.exports = router;
