const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const {
  getProductReviews,
  createReview,
  updateMyReview,
  deleteMyReview,
  getEligibleProductsForReview,
} = require("../controllers/review.controller");

router.get("/product/:productId", getProductReviews);
router.get("/eligible/products", authMiddleware, getEligibleProductsForReview);
router.post("/product/:productId", authMiddleware, createReview);
router.patch("/:id", authMiddleware, updateMyReview);
router.delete("/:id", authMiddleware, deleteMyReview);

module.exports = router;
