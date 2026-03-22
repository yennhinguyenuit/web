const express = require("express");
const router = express.Router();
const { getPaymentMethods } = require("../controllers/payment.controller");

router.get("/", getPaymentMethods);

module.exports = router;