import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Total Orders & counts by status
    const totalOrders = await prisma.order.count();
    const ordersByStatus = await prisma.order.groupBy({
      by: ['orderStatus'],
      _count: true,
    });

    const pendingOrders = await prisma.order.count({ where: { orderStatus: 'RECEIVED' } });
    const processingOrders = await prisma.order.count({ where: { orderStatus: 'PROCESSING' } });

    // 2. Total Revenue (Sum of totalAmount for all orders to show activity)
    const revenueData = await prisma.order.aggregate({
      where: { 
        // Showing all orders for revenue analytics as requested
        paymentStatus: { in: ['PAID', 'PENDING'] } 
      },
      _sum: { totalAmount: true },
    });
    const totalRevenue = revenueData._sum.totalAmount || 0;

    // 3. Customer Count
    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });

    // 4. Products (Total and Out of Stock)
    const totalProducts = await prisma.product.count();
    
    // Low stock variants (less than threshold or 5)
    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        stock: { lte: 5 }
      },
      include: {
        product: true
      },
      take: 25
    });

    const outOfStock = await prisma.productVariant.count({
      where: { stock: { lte: 0 } }
    });

    // 5. Recent Orders
    const recentOrders = await prisma.order.findMany({
      take: 25,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        },
      }
    });

    // 6. Sales Data (Last 7 days for the chart)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const paidOrdersLast7Days = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        // removed paymentStatus filter to show activity
      },
      select: {
        createdAt: true,
        totalAmount: true,
      }
    });

    // Group by day manually since Prisma groupBy on DateTime is tricky with precision
    const salesByDay: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      salesByDay[d.toISOString().split('T')[0]] = 0;
    }

    paidOrdersLast7Days.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0];
      if (salesByDay[day] !== undefined) {
        salesByDay[day] += order.totalAmount;
      }
    });

    const salesChart = Object.entries(salesByDay)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      summary: {
        totalOrders,
        pendingOrders,
        processingOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
        outOfStock,
      },
      recentOrders,
      salesChart,
      lowStockProducts: lowStockVariants.map(v => ({
        name: v.product.name,
        sku: v.sku || 'N/A',
        stock: v.stock,
        type: v.product.productType
      })),
      ordersByStatus,
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch dashboard statistics" });
  }
};
