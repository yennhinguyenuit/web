const express = require("express");
const router = express.Router();
const { getShippingMethods } = require("../controllers/shipping.controller");

router.get("/", getShippingMethods);

module.exports = router;