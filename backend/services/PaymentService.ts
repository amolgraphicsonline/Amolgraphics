import Razorpay from "razorpay";
import crypto from "crypto";
import logger from "../lib/logger";
import prisma from "../lib/prisma";

export interface CreateOrderParams {
  amount: number;
  currency: string;
  receipt: string;
}

export interface PaymentProvider {
  createOrder(params: CreateOrderParams): Promise<any>;
  verifyPayment(params: any): Promise<boolean>;
}

export class RazorpayProvider implements PaymentProvider {
  private instance: Razorpay;
  private secret: string;

  constructor(keyId: string, keySecret: string) {
    this.secret = keySecret;
    this.instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }

  async createOrder(params: CreateOrderParams) {
    try {
      const order = await this.instance.orders.create({
        amount: Math.round(params.amount * 100), // convert to paise
        currency: params.currency || "INR",
        receipt: params.receipt
      });
      return order;
    } catch (error) {
      logger.error("Razorpay order creation failed:", error);
      throw error;
    }
  }

  async verifyPayment(params: { razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }) {
    try {
      const body = params.razorpay_order_id + "|" + params.razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", this.secret)
        .update(body.toString())
        .digest("hex");

      return expectedSignature === params.razorpay_signature;
    } catch (error) {
      logger.error("Razorpay verification failed:", error);
      return false;
    }
  }
}

export class MockPaymentProvider implements PaymentProvider {
  async createOrder(params: CreateOrderParams) {
    logger.info("Using Mock Payment Provider for order creation");
    return {
      id: `mrzp_order_${Math.random().toString(36).substring(7)}`,
      amount: Math.round(params.amount * 100),
      currency: params.currency,
      receipt: params.receipt,
      status: "created"
    };
  }

  async verifyPayment(params: any) {
    logger.info("Using Mock Payment Provider for verification");
    return true; // Always valid in mock mode
  }
}

export class PaymentService {
  private static async getProvider(providerKey: string): Promise<PaymentProvider> {
    const settings = await prisma.storeSettings.findFirst();
    const isPlaceholder = (key: string) => !key || key.includes("your_") || key.includes("placeholder");
    
    const keyId = settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID || "";
    const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || "";

    if (providerKey.toUpperCase() === "RAZORPAY") {
      if (isPlaceholder(keyId) || isPlaceholder(keySecret)) {
        return new MockPaymentProvider();
      }
      return new RazorpayProvider(keyId, keySecret);
    }
    
    throw new Error(`Unsupported payment provider: ${providerKey}`);
  }

  static async createOrder(providerKey: string, params: CreateOrderParams) {
    const provider = await this.getProvider(providerKey);
    return provider.createOrder(params);
  }

  static async verifyPayment(providerKey: string, params: any) {
    const provider = await this.getProvider(providerKey);
    return provider.verifyPayment(params);
  }
}
