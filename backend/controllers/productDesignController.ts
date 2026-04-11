import { Request, Response } from "express";
import prisma from "../lib/prisma";

// GET /api/product-designs?category=acrylic
export const getProductDesigns = async (req: Request, res: Response) => {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const shape = req.query.shape ? String(req.query.shape) : undefined;
    const designs = await prisma.productDesign.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(shape ? { shape } : {}),
        isActive: true,
      },
      orderBy: { sortOrder: "asc" },
    });
    res.json(designs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch designs" });
  }
};

// GET /api/product-designs/all  (admin - includes inactive)
export const getAllProductDesigns = async (req: Request, res: Response) => {
  try {
    const category = req.query.category ? String(req.query.category) : undefined;
    const designs = await prisma.productDesign.findMany({
      where: category ? { category } : {},
      orderBy: { sortOrder: "asc" },
    });
    res.json(designs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch designs" });
  }
};

// POST /api/product-designs
export const createProductDesign = async (req: Request, res: Response) => {
  try {
    const { name, description, previewImage, layoutJson, photoCount, priceAdjustment, category, sortOrder, shape } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const design = await prisma.productDesign.create({
      data: {
        id: `design_${Date.now()}`,
        name,
        description: description || null,
        previewImage: previewImage || null,
        layoutJson: layoutJson || null,
        photoCount: Number(photoCount) || 1,
        priceAdjustment: Number(priceAdjustment) || 0,
        category: category || "acrylic",
        isActive: true,
        sortOrder: Number(sortOrder) || 0,
        shape: shape || null,
      },
    });
    res.status(201).json(design);
  } catch (error: any) {
    console.error("CreateDesign Error:", error);
    res.status(500).json({ error: error.message || "Failed to create design" });
  }
};

// PATCH /api/product-designs/:id
export const updateProductDesign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, previewImage, layoutJson, photoCount, priceAdjustment, category, isActive, sortOrder, shape } = req.body;

    const design = await prisma.productDesign.update({
      where: { id: String(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(previewImage !== undefined && { previewImage }),
        ...(layoutJson !== undefined && { layoutJson }),
        ...(photoCount !== undefined && { photoCount: Number(photoCount) }),
        ...(priceAdjustment !== undefined && { priceAdjustment: Number(priceAdjustment) }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(shape !== undefined && { shape }),
      },
    });
    res.json(design);
  } catch (error) {
    console.error("UpdateDesign Error:", error);
    res.status(500).json({ error: "Failed to update design" });
  }
};

// DELETE /api/product-designs/:id
export const deleteProductDesign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.productDesign.delete({ where: { id: String(id) } });
    res.json({ message: "Design deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete design" });
  }
};

// GET /api/product-designs/:id
export const getProductDesignById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const design = await prisma.productDesign.findUnique({
      where: { id: String(id) },
    });
    if (!design) return res.status(404).json({ error: "Design not found" });
    res.json(design);
  } catch (error) {
    console.error("GetDesign Error:", error);
    res.status(500).json({ error: "Failed to fetch design" });
  }
};
