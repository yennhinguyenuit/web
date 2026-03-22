const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const {
  getProfile,
  updateProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/account.controller");

router.use(authMiddleware);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

router.get("/addresses", getAddresses);
router.post("/addresses", createAddress);
router.patch("/addresses/:id", updateAddress);
router.delete("/addresses/:id", deleteAddress);

module.exports = router;