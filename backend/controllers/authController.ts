import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_in_prod";
const JWT_EXPIRES_IN = "7d";
const COOKIE_NAME = "amol_session";

// Secure cookie options — httpOnly so JS cannot access it (XSS protection)
const cookieOptions = {
  httpOnly: true,              // ✅ Not accessible via document.cookie (XSS-proof)
  secure: process.env.NODE_ENV === "production", // ✅ HTTPS-only in production
  sameSite: "lax" as const,   // ✅ CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: "/",
};

// Password strength validator — enforces big-platform standards
const validatePassword = (password: string): string | null => {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  return null; // valid
};

// Strip sensitive fields before sending user data
const sanitizeUser = (user: any) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  createdAt: user.createdAt,
});

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    // Enforce strong password
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // bcrypt with cost factor 12 (industry standard — Amazon/Google use 10-14)
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        id: `user_${Date.now()}`,
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set JWT in httpOnly cookie — never exposed to frontend JS
    res.cookie(COOKIE_NAME, token, cookieOptions);

    res.status(201).json({
      message: "Account created successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("[AUTH] Register error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Use consistent timing to prevent user enumeration attacks
    const dummyHash = "$2b$12$invalidhashfortimingconsistency000000000000000000000000";
    const passwordToCompare = user ? user.password : dummyHash;
    const isPasswordValid = await bcrypt.compare(password, passwordToCompare);

    if (!user || !isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set JWT in httpOnly cookie
    res.cookie(COOKIE_NAME, token, cookieOptions);

    res.json({
      message: "Login successful.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("[AUTH] Login error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// Get current session — used on page load to restore auth state
export const getMe = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      res.clearCookie(COOKIE_NAME, { path: "/" });
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    // Token invalid or expired
    res.clearCookie(COOKIE_NAME, { path: "/" });
    res.status(401).json({ message: "Session expired. Please log in again." });
  }
};

// Get orders for the logged-in user
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "Not authenticated." });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const orders = await prisma.order.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { product: true, design: true }
        }
      }
    });

    res.json(orders);
  } catch {
    res.status(401).json({ message: "Not authenticated." });
  }
};

// Secure logout — clears the httpOnly cookie server-side
export const logout = async (req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ message: "Logged out successfully." });
};
