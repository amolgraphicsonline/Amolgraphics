import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import prisma from "./lib/prisma";
import authRoutes from "./routes/authRoutes";
import settingRoutes from "./routes/settingRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import brandRoutes from "./routes/brandRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import orderRoutes from "./routes/orderRoutes";
import productDesignRoutes from "./routes/productDesignRoutes";
import customerRoutes from "./routes/customerRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import couponRoutes from "./routes/couponRoutes";
import bannerRoutes from "./routes/bannerRoutes";
import contactRoutes from "./routes/contactRoutes";
import reviewRoutes from "./routes/reviewRoutes";

import logger from "./lib/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers (XSS protection, MIME sniffing prevention, etc.)
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS — reflect requesting origin for secure credential parsing
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    return callback(null, origin);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));

app.use(cookieParser()); // Parse httpOnly auth cookies
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// Request Logger using Winston
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  next();
});

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "AmolGraphics Backend - DEBUG VERSION" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/product-designs", productDesignRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/reviews", reviewRoutes);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Catalog API routes registered`);
});

// Heartbeat to keep the process alive in some environments
setInterval(() => {
  // console.log("Heartbeat...");
}, 10000);
