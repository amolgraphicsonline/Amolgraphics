import { Router, Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { register, login, getMe, logout, getMyOrders } from "../controllers/authController";

const router = Router();

// Rate limiter: max 10 auth attempts per 15 min per IP — brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for register — max 5 registrations per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: "Too many registrations from this IP. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", registerLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", getMe);
router.get("/my-orders", getMyOrders);
router.post("/logout", logout);

export default router;
