const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const accountRoutes = require("./routes/account.routes");
const adminRoutes = require("./routes/admin.routes");
const shippingRoutes = require("./routes/shipping.routes");
const paymentRoutes = require("./routes/payment.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/shipping-methods", shippingRoutes);
app.use("/api/payment-methods", paymentRoutes);
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Không tìm thấy endpoint",
    data: null,
  });
});

app.use((err, req, res, next) => {
  console.error("Global error:", err);

  return res.status(500).json({
    success: false,
    message: err.message || "Lỗi server",
    data: null,
  });
});
module.exports = app;