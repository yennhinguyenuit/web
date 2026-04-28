const express = require("express");
const router = express.Router();

const prisma = require("../config/prisma"); // 👈 THÊM DÒNG NÀY

const authMiddleware = require("../middlewares/auth.middleware");
const {
  createOrder,
  getMyOrders,
  getOrderDetail,
  cancelOrder,
} = require("../controllers/order.controller");

router.use(authMiddleware);

router.get("/", getMyOrders);
router.get("/:id", getOrderDetail);

router.patch('/:id/status', async (req, res) => {
  console.log("👉 STATUS NHẬN ĐƯỢC:", req.body.status);

  const { id } = req.params;
  const { status } = req.body;

  await prisma.order.update({
    where: { id },
    data: { status },
  });

  res.json({ message: "Updated" });
});

module.exports = router;