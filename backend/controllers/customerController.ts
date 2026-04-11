import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import logger from "../lib/logger";

export const getCustomers = async (req: Request, res: Response) => {
  try {
    logger.info("Fetching aggregated customer intelligence...");

    // 1. Get all registered Users (role: USER)
    const registeredUsers = await prisma.user.findMany({
      where: { role: "USER" },
    });
    logger.info(`Found ${registeredUsers.length} registered users`);

    // 2. Get all Orders to pull guest footprints
    const allOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" }
    });
    logger.info(`Found ${allOrders.length} historical order records`);

    const customerMap = new Map<string, any>();

    // Process all orders first to build accurate profiles
    allOrders.forEach(order => {
      const email = (order.email || "").toLowerCase().trim();
      if (!email) return;

      const existing = customerMap.get(email);

      if (!existing) {
        customerMap.set(email, {
          id: `cust_${uuidv4().slice(0, 8)}`,
          name: order.customerName,
          email: email,
          phone: order.phone,
          address: order.address,
          city: order.city,
          state: order.state,
          pincode: order.pincode,
          type: "GUEST",
          orderCount: 1,
          totalSpent: Number(order.totalAmount || 0),
          lastOrderDate: order.createdAt,
          createdAt: order.createdAt,
          orders: [order]
        });
      } else {
        existing.orderCount += 1;
        existing.totalSpent += Number(order.totalAmount || 0);
        existing.orders.push(order);
        // Latest details win for profile info
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
           existing.name = order.customerName;
           existing.phone = order.phone;
           existing.address = order.address;
           existing.city = order.city;
           existing.state = order.state;
           existing.pincode = order.pincode;
           existing.lastOrderDate = order.createdAt;
        }
        // Oldest date is the anchor
        if (new Date(order.createdAt) < new Date(existing.createdAt)) {
           existing.createdAt = order.createdAt;
        }
      }
    });

    // Merge registered users
    registeredUsers.forEach(user => {
      const email = (user.email || "").toLowerCase().trim();
      const existing = customerMap.get(email);

      if (existing) {
        existing.type = "REGISTERED";
        existing.userId = user.id;
      } else {
        customerMap.set(email, {
          id: user.id || uuidv4(),
          name: user.name || "User",
          email: email,
          phone: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          type: "REGISTERED",
          orderCount: 0,
          totalSpent: 0,
          lastOrderDate: null,
          createdAt: user.createdAt,
          orders: []
        });
      }
    });

    const customersList = Array.from(customerMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    logger.info(`Aggregation complete: ${customersList.length} unique identities identified`);
    res.json(customersList);
  } catch (error: any) {
    logger.error(`Customer Aggregation Failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await prisma.user.create({
      data: {
        id: uuidv4(),
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "USER",
      },
    });
    res.status(201).json(customer);
  } catch (error: any) {
    if (error.code === "P2002") return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: error.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    if (typeof id !== 'string') return res.status(400).json({ error: "Invalid customer ID" });

    const updateData: any = { name, email: email?.toLowerCase().trim() };
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const customer = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') return res.status(400).json({ error: "Invalid ID" });
    if (!id.startsWith('cust_')) await prisma.user.delete({ where: { id } });
    res.json({ message: "Identity removal complete" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
