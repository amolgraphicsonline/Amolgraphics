import { Request, Response } from "express";
import prisma from "../lib/prisma";

// --- CATEGORY MANAGEMENT ---

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        categoryAttributes: {
          where: { isActive: true },
          include: {
            attributeOptions: {
              where: { isActive: true }
            },
          },
        },
        _count: {
          select: { products: true }
        }
      },
    });
    res.json(categories);
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id as string },
      include: {
        categoryAttributes: {
          include: {
            attributeOptions: true,
          },
        },
        _count: {
          select: { products: true }
        }
      },
    });
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, image, parentId, order, tags } = req.body;
    const category = await prisma.category.create({
      data: {
        id: `cat_${Date.now()}`,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        image,
        parentId: parentId || null,
        order: order || 0,
        tags,
        updatedAt: new Date(),
      },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create category" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, slug, description, image, parentId, order, tags } = req.body;
    
    console.log(`Debug: Updating category ${id}`, { name, slug, order, tags });
    
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
        tags,
        order: order !== undefined ? order : undefined,
        updatedAt: new Date(),
      },
    });
    res.json(category);
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return res.status(404).json({ error: "Category not found" });

    const timestamp = Date.now();
    await prisma.category.update({
      where: { id },
      data: { 
        isActive: false,
        name: `${category.name} (archived-${timestamp})`,
        slug: `${category.slug}-archived-${timestamp}`,
        updatedAt: new Date()
      }
    });

    res.json({ message: "Category deactivated and archived successfully" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({ error: "Failed to deactivate category" });
  }
};

export const reorderCategories = async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // Array of { id: string, order: number, parentId: string | null }
    
    // Use a transaction for atomic updates
    await prisma.$transaction(
      items.map((item: any) => 
        prisma.category.update({
          where: { id: item.id },
          data: { 
            order: item.order,
            parentId: item.parentId
          }
        })
      )
    );
    
    res.json({ message: "Categories reordered successfully" });
  } catch (error) {
    console.error("Reorder Categories Error:", error);
    res.status(500).json({ error: "Failed to reorder categories" });
  }
};

// --- ATTRIBUTE MANAGEMENT ---

export const addCategoryAttribute = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.categoryId as string;
    const { name, type } = req.body; // type e.g. "SELECT", "COLOR_PICKER"

    const attribute = await prisma.categoryAttribute.create({
      data: {
        id: `cat-attr-${Date.now()}`,
        categoryId,
        name,
        type,
        updatedAt: new Date(),
      },
    });
    res.status(201).json(attribute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create category attribute" });
  }
};

export const addAttributeOption = async (req: Request, res: Response) => {
  try {
    const attributeId = req.params.attributeId as string;
    const { value, displayValue, image, price, thickness, mounting } = req.body;

    const option = await (prisma.attributeOption as any).create({
      data: {
        id: `attr-opt-${Date.now()}`,
        categoryAttributeId: attributeId,
        value,
        displayValue,
        image,
        price: price || 0,
        thickness,
        mounting,
        updatedAt: new Date(),
      },
    });
    res.status(201).json(option);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add attribute option" });
  }
};

export const deleteCategoryAttribute = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.categoryAttribute.update({
      where: { id: id },
      data: { isActive: false, updatedAt: new Date() }
    });
    res.json({ message: "Attribute deactivated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to deactivate attribute" });
  }
};

export const deleteAttributeOption = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.attributeOption.update({
      where: { id: id as string },
      data: { isActive: false, updatedAt: new Date() }
    });
    res.json({ message: "Option deactivated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to deactivate option" });
  }
};

export const updateCategoryAttribute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    const attribute = await prisma.categoryAttribute.update({
      where: { id: id as string },
      data: { name, type, updatedAt: new Date() },
    });
    res.json(attribute);
  } catch (error) {
    res.status(500).json({ error: "Failed to update attribute" });
  }
};

export const updateAttributeOption = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { value, displayValue, image, price, thickness, mounting } = req.body;
    const option = await (prisma.attributeOption as any).update({
      where: { id: id as string },
      data: { value, displayValue, image, price, thickness, mounting, updatedAt: new Date() },
    });
    res.json(option);
  } catch (error) {
    res.status(500).json({ error: "Failed to update option" });
  }
};
