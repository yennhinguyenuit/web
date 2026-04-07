const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const accountRoutes = require("./routes/account.routes");
const adminRoutes = require("./routes/admin.routes");
const shippingRoutes = require("./routes/shipping.routes");
const paymentMethodRoutes = require("./routes/payment-methods.routes");
const paymentRoutes = require("./routes/payment-transactions.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const reviewRoutes = require("./routes/review.routes");
const couponRoutes = require("./routes/coupon.routes");
const { isAppError } = require("./utils/app-error");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin không được phép bởi CORS"));
    },
  })
);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Quá nhiều request, vui lòng thử lại sau",
  },
});

app.use(globalLimiter);

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
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Không tìm thấy endpoint",
    data: null,
  });
});

app.use((err, req, res, next) => {
  console.error("Global error:", err);

  if (isAppError(err)) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details || null,
    });
  }

  if (err.message === "Origin không được phép bởi CORS") {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Lỗi server",
    data: null,
  });
});

module.exports = app;
