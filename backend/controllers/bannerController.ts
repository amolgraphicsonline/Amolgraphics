import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getBanners = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    const banners = await prisma.banner.findMany({
      where: {
        ...(categoryId ? { categoryId: String(categoryId) } : {}),
        isActive: true,
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

export const getBannerByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const banner = await prisma.banner.findFirst({
      where: { categoryId: String(categoryId), isActive: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch banner" });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const { title, subtitle, imageUrl, categoryId, isActive } = req.body;
    const banner = await prisma.banner.create({
      data: {
        id: `banner_${Date.now()}`,
        title,
        subtitle: subtitle || null,
        imageUrl,
        categoryId: categoryId === "" ? null : (categoryId || null),
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ error: "Failed to create banner" });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, subtitle, imageUrl, categoryId, isActive } = req.body;
    const banner = await prisma.banner.update({
      where: { id: String(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(categoryId !== undefined && { categoryId: categoryId === "" ? null : categoryId }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: "Failed to update banner" });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id: String(id) } });
    res.json({ message: "Banner deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete banner" });
  }
};
