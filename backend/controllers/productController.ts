import { Request, Response } from "express";
import prisma from "../lib/prisma";
import Papa from 'papaparse';
import logger from "../lib/logger";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    
    const products = await prisma.product.findMany({
      where: categoryId ? { categoryId: categoryId as string } : {},
      include: {
        category: {
          include: {
            categoryAttributes: {
              include: {
                attributeOptions: true
              }
            }
          }
        },
        brand: true,
        variants: {
          include: {
            variantAttributes: true
          }
        },
        attributes: {
          include: {
            options: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            categoryAttributes: {
              include: {
                attributeOptions: true
              }
            }
          }
        },
        brand: true,
        variants: {
          include: {
            variantAttributes: true
          }
        },
        attributes: {
          include: {
            options: true
          }
        }
      },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          include: {
            categoryAttributes: {
              include: {
                attributeOptions: true
              }
            }
          }
        },
        brand: true,
        variants: {
          include: {
            variantAttributes: true
          }
        },
        attributes: {
          include: {
            options: true
          }
        }
      },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { 
      name, slug, description, shortDescription, productType, status,
      mainImage, images, categoryId, brandId,
      regularPrice, salePrice, saleStartDate, saleEndDate,
      weight, length, width, height,
      trackInventory, allowBackorders, lowStockThreshold, stockQuantity, sku,
      tags,
      isVirtual, isDownloadable, isSoldIndividually,
      externalUrl, buttonText,
      purchaseNote, menuOrder, enableReviews,
      upsellIds, crossSellIds,
      productAttributes, variants,
      isReadyToSale,
      minPhotos, maxPhotos
    } = req.body;

    if (!categoryId) {
      return res.status(400).json({ error: "Select category of the product for creating product" });
    }
    
    const product = await (prisma.product.create as any)({
      data: {
        id: `prod_${Date.now()}`,
        name,
        slug: await generateUniqueSlug(slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')),
        description,
        shortDescription,
        productType: productType || "SIMPLE",
        status: status || "PUBLISHED",
        mainImage,
        images: Array.isArray(images) ? JSON.stringify(images) : images,
        categoryId,
        brandId,
        regularPrice: regularPrice ? parseFloat(regularPrice) : null,
        salePrice: salePrice ? parseFloat(salePrice) : null,
        saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
        saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
        weight: weight ? parseFloat(weight) : null,
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        trackInventory: trackInventory ?? false,
        allowBackorders: allowBackorders ?? false,
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 5,
        soldIndividually: isSoldIndividually ?? false,
        isVirtual: isVirtual ?? false,
        isDownloadable: isDownloadable ?? false,
        externalUrl: externalUrl || null,
        buttonText: buttonText || null,
        purchaseNote: purchaseNote || null,
        menuOrder: menuOrder ? parseInt(menuOrder) : 0,
        enableReviews: enableReviews ?? true,
        upsellIds: upsellIds || null,
        crossSellIds: crossSellIds || null,
        tags: tags || null,
        isReadyToSale: isReadyToSale ?? false,
        minPhotos: minPhotos ? parseInt(minPhotos) : 0,
        maxPhotos: maxPhotos ? parseInt(maxPhotos) : 0,
        updatedAt: new Date(),
        
        // Custom product attributes (like WooCommerce)
        attributes: productAttributes && Array.isArray(productAttributes) ? {
          create: productAttributes.map((pa: any) => ({
            id: `pa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: pa.name,
            type: pa.type || "SELECT",
            options: {
              create: (pa.options || pa.values || []).map((opt: any) => {
                const val = typeof opt === 'string' ? opt : (opt.value || opt.displayValue || "");
                return {
                  id: `pao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  value: val,
                  displayValue: typeof opt === 'string' ? opt : (opt.displayValue || opt.value || "")
                };
              })
            }
          }))
        } : undefined,

        // Variations logic
        variants: variants && Array.isArray(variants) && variants.length > 0 ? {
          create: variants.map((v: any) => ({
            id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            price: parseFloat(v.price) || 0,
            salePrice: v.salePrice ? parseFloat(v.salePrice) : null,
            sku: v.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            stock: parseInt(v.stock) || 0,
            stockStatus: v.stockStatus || "IN_STOCK",
            manageStock: v.manageStock ?? true,
            weight: v.weight ? parseFloat(v.weight) : null,
            length: v.length ? parseFloat(v.length) : null,
            width: v.width ? parseFloat(v.width) : null,
            height: v.height ? parseFloat(v.height) : null,
            isVirtual: v.isVirtual ?? false,
            isDownloadable: v.isDownloadable ?? false,
            variantImage: v.variantImage,
            isDefault: v.isDefault || false,
            updatedAt: new Date(),
            variantAttributes: v.attributes && Array.isArray(v.attributes) ? {
              create: v.attributes.map((va: any) => ({
                id: `va_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                attributeName: va.name,
                attributeValue: va.value
              }))
            } : undefined
          }))
        } : (productType === "SIMPLE" ? {
          create: [{
            id: `v_${Date.now()}`,
            price: regularPrice ? parseFloat(regularPrice) : 0,
            salePrice: salePrice ? parseFloat(salePrice) : null,
            saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
            saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
            sku: sku || slug || `SKU-${Date.now()}`,
            stock: parseInt(stockQuantity) || 0,
            isDefault: true,
            updatedAt: new Date()
          }]
        } : undefined)
      },
      include: {
        variants: {
          include: {
            variantAttributes: true
          }
        },
        attributes: {
          include: {
            options: true
          }
        }
      }
    });

    res.status(201).json(product);
  } catch (error: any) {
    logger.error("Product Creation Error", { error: error.message, stack: error.stack });
    if (error.code === 'P2003') {
      return res.status(400).json({ error: "Foreign key constraint failed. Please ensure Category and Brand exist." });
    }
    res.status(500).json({ error: error.message || "Failed to create product" });
  }
};
 
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        await prisma.product.delete({ where: { id: req.params.id as string } });
        res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
        console.error("DELETE PRODUCT ERROR:", error);
        if (error.code === 'P2003') {
            return res.status(400).json({ error: "Cannot delete product because it is linked to other records (Orders, Cart Items, etc.)" });
        }
        res.status(500).json({ error: "Failed to delete product" });
    }
};

export const bulkDeleteProducts = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "Invalid product IDs" });
        }
        
        await prisma.product.deleteMany({
            where: { id: { in: ids } }
        });
        
        res.json({ message: "Products deleted successfully" });
    } catch (error: any) {
        console.error("BULK DELETE PRODUCT ERROR:", error);
        if (error.code === 'P2003') {
            return res.status(400).json({ error: "Some products could not be deleted as they are linked to orders or other records." });
        }
        res.status(500).json({ error: "Failed to perform bulk delete" });
    }
};

export const addVariant = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    const { price, salePrice, saleStartDate, saleEndDate, sku, stock, variantImage, isDefault, attributes } = req.body;

    // If this variant is default, unset other defaults
    if (isDefault) {
      await prisma.productVariant.updateMany({
        where: { productId },
        data: { isDefault: false },
      });
    }

    const variant = await prisma.productVariant.create({
      data: {
        id: `v_${Date.now()}`,
        productId,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
        saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
        sku: sku || `SKU-${Date.now()}`,
        stock: parseInt(stock) || 0,
        variantImage,
        isDefault: isDefault || false,
        updatedAt: new Date(),
        variantAttributes: attributes && Array.isArray(attributes) ? {
          create: attributes.map((attr: any) => ({
            id: `va_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            attributeName: attr.attributeName,
            attributeValue: attr.attributeValue
          }))
        } : undefined
      },
      include: {
        variantAttributes: true
      }
    });

    res.status(201).json(variant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create variant" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { 
      name, slug, description, shortDescription, productType, status,
      mainImage, images, categoryId, brandId,
      regularPrice, salePrice, saleStartDate, saleEndDate,
      weight, length, width, height,
      trackInventory, allowBackorders, lowStockThreshold,
      stock, stockQuantity, sku, tags,
      isVirtual, isDownloadable, isSoldIndividually,
      externalUrl, buttonText,
      purchaseNote, menuOrder, enableReviews,
      upsellIds, crossSellIds,
      isReadyToSale
    } = req.body;
    
    const updateData: any = {
      updatedAt: new Date()
    };

    if (categoryId === "") {
        return res.status(400).json({ error: "Select category of the product for creating product" });
    }

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (productType !== undefined) updateData.productType = productType;
    if (status !== undefined) updateData.status = status;
    if (mainImage !== undefined) updateData.mainImage = mainImage;
    if (images !== undefined) updateData.images = Array.isArray(images) ? JSON.stringify(images) : images;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (brandId !== undefined) updateData.brandId = brandId;
    if (regularPrice !== undefined) updateData.regularPrice = regularPrice !== "" ? parseFloat(regularPrice) : null;
    if (salePrice !== undefined) updateData.salePrice = salePrice !== "" ? parseFloat(salePrice) : null;
    if (tags !== undefined) updateData.tags = tags;
    if (saleStartDate !== undefined) updateData.saleStartDate = saleStartDate ? new Date(saleStartDate) : null;
    if (saleEndDate !== undefined) updateData.saleEndDate = saleEndDate ? new Date(saleEndDate) : null;
    if (weight !== undefined) updateData.weight = weight ? parseFloat(weight) : null;
    if (length !== undefined) updateData.length = length ? parseFloat(length) : null;
    if (width !== undefined) updateData.width = width ? parseFloat(width) : null;
    if (height !== undefined) updateData.height = height ? parseFloat(height) : null;
    if (trackInventory !== undefined) updateData.trackInventory = trackInventory;
    if (allowBackorders !== undefined) updateData.allowBackorders = allowBackorders;
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold ? parseInt(lowStockThreshold) : 5;
    if (isSoldIndividually !== undefined) updateData.soldIndividually = isSoldIndividually;
    if (isVirtual !== undefined) updateData.isVirtual = isVirtual;
    if (isDownloadable !== undefined) updateData.isDownloadable = isDownloadable;
    if (externalUrl !== undefined) updateData.externalUrl = externalUrl || null;
    if (buttonText !== undefined) updateData.buttonText = buttonText || null;
    if (purchaseNote !== undefined) updateData.purchaseNote = purchaseNote || null;
    if (menuOrder !== undefined) updateData.menuOrder = menuOrder ? parseInt(menuOrder) : 0;
    if (enableReviews !== undefined) updateData.enableReviews = enableReviews;
    if (upsellIds !== undefined) updateData.upsellIds = upsellIds || null;
    if (crossSellIds !== undefined) updateData.crossSellIds = crossSellIds || null;
    if (tags !== undefined) updateData.tags = tags || null;
    if (isReadyToSale !== undefined) updateData.isReadyToSale = isReadyToSale;
    if (req.body.minPhotos !== undefined) updateData.minPhotos = parseInt(req.body.minPhotos) || 0;
    if (req.body.maxPhotos !== undefined) updateData.maxPhotos = parseInt(req.body.maxPhotos) || 0;
    
    // Note: sku and stock are NOT fields on the Product model in Prisma schema, 
    // they belong to the ProductVariant model. We handle them below.
    // Handle nested attribute updates (Delete and Recreate strategy)
    const { productAttributes } = req.body;
    if (productAttributes && Array.isArray(productAttributes)) {
      await prisma.productAttribute.deleteMany({ where: { productId: id } });
      updateData.attributes = {
        create: productAttributes.map((pa: any) => ({
          id: `pa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: pa.name,
          type: pa.type || "SELECT",
          options: {
            create: (pa.options || pa.values || []).map((opt: any) => {
              const val = typeof opt === 'string' ? opt : (opt.value || opt.displayValue || "");
              return {
                id: `pao_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                value: val,
                displayValue: typeof opt === 'string' ? opt : (opt.displayValue || opt.value || "")
              };
            })
          }
        }))
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    const stockVal = req.body.stock ?? req.body.stockQuantity;
    const skuVal = req.body.sku;

    const defaultVariant = await prisma.productVariant.findFirst({
      where: { productId: id, isDefault: true }
    });

    if (defaultVariant) {
      await prisma.productVariant.update({
        where: { id: defaultVariant.id },
        data: {
          price: regularPrice !== undefined ? parseFloat(regularPrice) : undefined,
          salePrice: salePrice !== undefined ? parseFloat(salePrice) : undefined,
          saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
          saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
          stock: stockVal !== undefined ? parseInt(stockVal) : undefined,
          sku: skuVal !== undefined ? skuVal : undefined,
          updatedAt: new Date()
        }
      });
    } else if (productType === "SIMPLE") {
      await prisma.productVariant.create({
        data: {
          id: `v_${Date.now()}`,
          productId: id,
          price: regularPrice ? parseFloat(regularPrice) : 0,
          salePrice: salePrice ? parseFloat(salePrice) : null,
          saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
          saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
          stock: stockVal ? parseInt(stockVal) : 0,
          isDefault: true,
          updatedAt: new Date(),
          sku: skuVal || slug || `SKU-${Date.now()}`
        }
      });
    }

      // Handle full variants update if provided (for VARIABLE products)
      const { variants } = req.body;
      if (variants && Array.isArray(variants) && variants.length > 0) {
          // Delete old variants (careful: this might affect order history if not handled with soft deletes or links)
          // For now, let's just update based on ID or recreate
          for (const v of variants) {
              if (v.id && !v.id.startsWith('new_')) {
                  await prisma.productVariant.update({
                      where: { id: v.id },
                      data: {
                          price: parseFloat(v.price) || 0,
                          salePrice: v.salePrice ? parseFloat(v.salePrice) : null,
                          saleStartDate: v.saleStartDate ? new Date(v.saleStartDate) : null,
                          saleEndDate: v.saleEndDate ? new Date(v.saleEndDate) : null,
                          sku: v.sku,
                          stock: parseInt(v.stock) || 0,
                          stockStatus: v.stockStatus || "IN_STOCK",
                          manageStock: v.manageStock ?? true,
                          weight: v.weight ? parseFloat(v.weight) : null,
                          length: v.length ? parseFloat(v.length) : null,
                          width: v.width ? parseFloat(v.width) : null,
                          height: v.height ? parseFloat(v.height) : null,
                          variantImage: v.variantImage,
                          updatedAt: new Date()
                      }
                  });
              } else {
                  await prisma.productVariant.create({
                      data: {
                          id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                          productId: id,
                           price: parseFloat(v.price) || 0,
                           salePrice: v.salePrice ? parseFloat(v.salePrice) : null,
                           saleStartDate: v.saleStartDate ? new Date(v.saleStartDate) : null,
                           saleEndDate: v.saleEndDate ? new Date(v.saleEndDate) : null,
                           sku: v.sku || `SKU-${Date.now()}`,
                           stock: parseInt(v.stock) || 0,
                           stockStatus: v.stockStatus || "IN_STOCK",
                           manageStock: v.manageStock ?? true,
                           weight: v.weight ? parseFloat(v.weight) : null,
                           length: v.length ? parseFloat(v.length) : null,
                           width: v.width ? parseFloat(v.width) : null,
                           height: v.height ? parseFloat(v.height) : null,
                           variantImage: v.variantImage,
                           updatedAt: new Date(),
                          variantAttributes: v.attributes ? {
                              create: v.attributes.map((va: any) => ({
                                  id: `va_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                                  attributeName: va.name,
                                  attributeValue: va.value
                              }))
                          } : undefined
                      }
                  });
              }
          }
      }

    res.json(product);
  } catch (error: any) {
    logger.error("Update Product Error Details", { id: req.params.id, error: error.message, stack: error.stack });
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Duplicate value detected: " + (error.meta?.target || "Field conflict") });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: "Foreign key constraint failed. Please ensure Category and Brand exist." });
    }
    res.status(500).json({ error: error.message || "Failed to update product" });
  }
};

export const duplicateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const source = await prisma.product.findUnique({
      where: { id },
      include: { variants: { include: { variantAttributes: true } } }
    });
    if (!source) return res.status(404).json({ error: "Product not found" });

    const newProduct = await prisma.product.create({
      data: {
        id: `prod_${Date.now()}`,
        name: `${source.name} (Copy)`,
        slug: `${source.slug}-copy-${Date.now()}`,
        description: source.description,
        mainImage: source.mainImage,
        images: typeof source.images === 'string' ? source.images : JSON.stringify(source.images || []),
        categoryId: source.categoryId,
        trackInventory: source.trackInventory,
        variants: {
          create: source.variants.map((v: any) => ({
             id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
             price: v.price,
             sku: `${v.sku}-COPY-${Date.now()}`,
             stock: v.stock,
             isDefault: v.isDefault,
             variantAttributes: {
               create: v.variantAttributes.map((a: any) => ({
                 id: `va_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                 attributeName: a.attributeName,
                 attributeValue: a.attributeValue
               }))
             }
          }))
        }
      }
    });

    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to duplicate product" });
  }
};

export const deleteVariant = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.productVariant.delete({ where: { id } });
    res.json({ message: "Variant deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete variant" });
  }
};

export const exportProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true
      }
    });

    const data = products.map(p => {
      const defaultVariant = p.variants.find(v => v.isDefault) || p.variants[0];
      return {
        ID: p.id,
        Name: p.name,
        Slug: p.slug,
        Category: p.category?.name || 'Uncategorized',
        Status: p.status,
        ProductType: p.productType,
        RegularPrice: p.regularPrice,
        SalePrice: p.salePrice,
        SKU: defaultVariant?.sku || '',
        Stock: defaultVariant?.stock || 0,
        MainImage: p.mainImage
      };
    });

    const csv = Papa.unparse(data);
    logger.info(`Products exported successfully`, { count: products.length });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products_export.csv');
    res.status(200).send(csv);
  } catch (error: any) {
    logger.error("Export Error", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Failed to export products" });
  }
};

export const importProducts = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    const csvData = req.file.buffer.toString();
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    const rows = parsed.data;

    let importedCount = 0;
    let skippedCount = 0;

    for (const rawRow of rows as any[]) {
      // Normalize row keys to lowercase for robust matching
      const row: any = {};
      Object.keys(rawRow).forEach(key => {
        row[key.toLowerCase().trim()] = rawRow[key];
      });

      const name = row.name || row.title || row.productname;
      if (!name) {
        skippedCount++;
        continue;
      }

      // 1. Find or create Category
      let categoryId = "";
      const catName = row.category || row.categoryname;
      if (catName) {
        let category = await prisma.category.findFirst({ where: { name: catName } });
        if (!category) {
          const catId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          category = await prisma.category.create({
            data: {
              id: catId,
              name: catName,
              slug: catName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            }
          });
        }
        categoryId = category.id;
      } else {
        const defaultCat = await prisma.category.findFirst({ where: { name: "Uncategorized" } });
        if (defaultCat) {
          categoryId = defaultCat.id;
        } else {
            const cat = await prisma.category.create({
                data: {
                    id: "cat_default",
                    name: "Uncategorized",
                    slug: "uncategorized"
                }
            });
            categoryId = cat.id;
        }
      }

      // 2. Identification Logic
      const skuToSearch = row.sku || row.productsku;
      const slugToSearch = row.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      const existingSource = await prisma.product.findFirst({
        where: {
          OR: [
            { slug: slugToSearch },
            skuToSearch ? { variants: { some: { sku: skuToSearch } } } : undefined
          ].filter(Boolean) as any
        },
        include: { variants: true }
      });

      const regularPrice = parseFloat(row.regularprice || row.price || "0");
      const salePrice = parseFloat(row.saleprice) || null;
      const mainImage = row.mainimage || row.image || row.imageurl || row.productimage;
      const stockCount = parseInt(row.stock || row.inventory || "0");

      if (existingSource) {
        await prisma.product.update({
          where: { id: existingSource.id },
          data: {
            name: name,
            status: row.status || existingSource.status,
            regularPrice: regularPrice || existingSource.regularPrice,
            salePrice: salePrice || existingSource.salePrice,
            mainImage: mainImage || existingSource.mainImage,
            categoryId: categoryId || existingSource.categoryId,
            updatedAt: new Date()
          }
        });
        
        const targetVariant = existingSource.variants.find(v => v.sku === skuToSearch) || existingSource.variants.find(v => v.isDefault);
        if (targetVariant) {
            await prisma.productVariant.update({
                where: { id: targetVariant.id },
                data: {
                    price: salePrice || regularPrice || targetVariant.price,
                    stock: stockCount || targetVariant.stock,
                    sku: skuToSearch || targetVariant.sku,
                    updatedAt: new Date()
                }
            });
        }
      } else {
        const prodId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        await prisma.product.create({
          data: {
            id: prodId,
            name: name,
            slug: slugToSearch + '-' + Math.random().toString(36).substr(2, 3),
            status: row.status || "PUBLISHED",
            categoryId: categoryId,
            regularPrice: regularPrice,
            salePrice: salePrice,
            mainImage: mainImage,
            productType: row.producttype || "SIMPLE",
            variants: {
               create: {
                  id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                  price: salePrice || regularPrice || 0,
                  stock: stockCount,
                  sku: skuToSearch || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
                  isDefault: true,
                  updatedAt: new Date()
               }
            }
          }
        });
      }
      importedCount++;
    }

    logger.info(`Product import complete`, { imported: importedCount, skipped: skippedCount });
    res.json({ message: `Import complete. ${importedCount} processed, ${skippedCount} skipped.` });
  } catch (error: any) {
    logger.error("Import Error", { error: error.message, stack: error.stack });
    res.status(500).json({ error: "Import failed: " + (error.message || "Unknown error") });
  }
};
