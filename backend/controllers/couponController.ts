import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, validUntil, usageLimit } = req.body;
    
    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) return res.status(400).json({ message: "Coupon already exists" });

    const coupon = await prisma.coupon.create({
      data: {
        id: `cpn_${Math.random().toString(36).substr(2, 9)}`,
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        validUntil: validUntil ? new Date(validUntil) : null,
        usageLimit: Number(usageLimit) || null,
        isActive: true
      }
    });
    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, discountValue, minOrderAmount, validUntil, usageLimit } = req.body;

    const coupon = await prisma.coupon.update({
      where: { id: id as string },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
        ...(minOrderAmount !== undefined && { minOrderAmount: Number(minOrderAmount) }),
        ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
        ...(usageLimit !== undefined && { usageLimit: Number(usageLimit) })
      }
    });

    res.json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id: id as string } });
    res.json({ message: "Coupon deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
