const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
} = require("../controllers/wishlist.controller");

router.use(authMiddleware);

router.get("/", getWishlist);
router.post("/", addWishlistItem);
router.delete("/:productId", removeWishlistItem);

module.exports = router;
