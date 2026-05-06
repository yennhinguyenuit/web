const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
  getActiveFlashSale,
  createFlashSale,
  deleteFlashSale,
} = require("../controllers/flash-sale.controller");

const router = express.Router();

router.get("/active", getActiveFlashSale);
router.post("/", authMiddleware, roleMiddleware("admin"), createFlashSale);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteFlashSale);

module.exports = router;
