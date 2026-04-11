import prisma from "../lib/prisma";
import logger from "../lib/logger";

export class InventoryService {
  /**
   * Check if stock is available for a list of items
   * Supports both simple products and variable products (variants)
   */
  static async checkStockAvailability(items: Array<{ productId: string, variantId?: string, quantity: number }>): Promise<boolean> {
    try {
      for (const item of items) {
        if (item.variantId) {
          const variant = await prisma.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true, manageStock: true }
          });
          
          if (variant && variant.manageStock && variant.stock < item.quantity) {
            logger.warn(`OutOfStock: Variant ${item.variantId} has only ${variant.stock} units but ${item.quantity} requested`);
            return false;
          }
        } else {
          // Safety: findUnique will crash if ID is null/undefined. Studio items may have no productId.
          const currentId = item.productId;
          if (!currentId) {
            // No product ID means it's a custom/studio item — skip inventory check
            continue;
          }
          const product = await prisma.product.findUnique({
            where: { id: currentId },
            select: { trackInventory: true }
          });
          
          if (!product) {
             // Resilience: Skip inventory for dynamic/studio items that don't have a stock entry yet
             continue;
          }
        }
      }
      return true;
    } catch (error) {
      logger.error("Error checking stock availability:", error);
      throw error;
    }
  }

  /**
   * Deduct stock after successful order placement
   * Must be run within a transaction Usually
   */
  static async deductStock(tx: any, items: Array<{ productId: string, variantId?: string, quantity: number }>) {
    for (const item of items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity }
          }
        });
        
        // Update stock status if zero
        const updated = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true }
        });
        
        if (updated.stock <= 0) {
            await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stockStatus: "OUT_OF_STOCK" }
            });
        }
      }
    }
  }

  /**
   * Restore stock (e.g. after cancellation)
   */
  static async restoreStock(tx: any, items: Array<{ productId: string, variantId?: string, quantity: number }>) {
    for (const item of items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { increment: item.quantity },
            stockStatus: "IN_STOCK"
          }
        });
      }
    }
  }
}
