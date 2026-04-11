import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getBrands = async (req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brands" });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const { name, logo, slug } = req.body;
    const brand = await prisma.brand.create({
      data: {
        id: `brand_${Date.now()}`,
        name,
        logo,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      },
    });
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ error: "Failed to create brand" });
  }
};
