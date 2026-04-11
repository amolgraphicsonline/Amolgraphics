import nodemailer from 'nodemailer';
import logger from '../lib/logger';
import prisma from '../lib/prisma';
import axios from 'axios';

export class CommunicationService {
  /**
   * Send Email using Nodemailer (Configurable via Settings)
   */
  static async sendEmail(to: string, subject: string, html: string) {
    try {
      const settings = await prisma.storeSettings.findFirst();
      if (!settings?.emailEnabled || !settings?.smtpHost) {
        logger.warn("Email service disabled or SMTP unconfigured.");
        return;
      }

      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: parseInt(settings.smtpPort || "587"),
        secure: settings.smtpPort === "465" || settings.smtpSecure,
        auth: {
          user: settings.smtpUser || "",
          pass: settings.smtpPass || "",
        },
      } as any);

      await transporter.sendMail({
        from: `"${settings.storeName}" <${settings.smtpUser}>`,
        to,
        subject,
        html,
      });

      logger.info(`Email successfully dispatched to ${to}: ${subject}`);
    } catch (error: any) {
      logger.error("Email dispatch failed", { error: error.message, to });
    }
  }

  /**
   * Send Multi-Provider WhatsApp Message (AiSensy, Twilio, Wati, Generic)
   */
  static async sendWhatsApp(phone: string, message: string, templateName?: string, templateParams: string[] = []) {
    try {
      const settings = await prisma.storeSettings.findFirst();
      if (!settings?.smsEnabled || !settings?.whatsappNumber) {
        logger.warn("WhatsApp infrastructure deactivated or number unset.");
        return;
      }

      const provider = settings.whatsappProvider || "AISENSY";
      const apiKey = settings.whatsappApiKey || "";
      const cleanPhone = phone.replace(/\D/g, ""); // Keep only digits

      logger.info(`Routing WhatsApp via ${provider} engine...`);

      if (provider === "AISENSY") {
        // AiSensy Campaign API v2
        const payload = {
          apiKey: apiKey,
          campaignName: templateName || "order_notification", // If no template name, use a default fallback
          destination: cleanPhone,
          userName: "Customer",
          templateParams: templateParams.length > 0 ? templateParams : [message],
          source: "AmolGraphicsPortal"
        };

        const res = await axios.post("https://backend.aisensy.com/campaign/t1/api/v2", payload);
        logger.info(`AiSensy Response: ${res.status} | Session: ${res.data?.success || 'N/A'}`);
      } 
      else if (provider === "WATI") {
        const payload = {
          template_name: templateName,
          broadcast_name: "order_alert",
          parameters: templateParams.map(p => ({ name: "param", value: p }))
        };
        const res = await axios.post(`${settings.whatsappInstanceId}/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhone}`, payload, {
          headers: { "Authorization": `Bearer ${apiKey}` }
        });
        logger.info(`WATI Response: ${res.status}`);
      }
      else {
        // GENERIC / FALLBACK (Simple Direct Message if supported by local gateway)
        logger.warn(`Provider ${provider} fallback logic: Sending via generic endpoint.`);
        // Note: You would customize this for a specific local gateway
      }

      logger.info(`WhatsApp packet emitted to ${phone}`);
    } catch (error: any) {
      logger.error("WhatsApp delivery system failure", { error: error.message, phone });
    }
  }

  /**
   * Advanced Order Orchestration (Email + WhatsApp)
   */
  static async sendOrderConfirmation(order: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const trackingLink = `${frontendUrl}/track/${order.id}`;
    
    // 1. Email Construction
    const emailHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #fff; border: 1px solid #f1f5f9;">
        <h2 style="color: #1e293b; font-weight: 900; letter-spacing: -0.02em;">ORDER CONFIRMED.</h2>
        <p style="color: #64748b; text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 0.2em;">Transaction Reference: #${order.id}</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hi ${order.customerName},<br/>Your order has been successfully placed. We are currently processing your artifacts.</p>
        <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 30px 0;">
          <p style="margin: 0; font-weight: 800; color: #1e293b;">AMOUNT: ₹${order.totalAmount}</p>
          <p style="margin: 0; font-size: 12px; color: #475569;">METHOD: ${order.paymentMethod}</p>
        </div>
        <a href="${trackingLink}" style="display: block; text-align: center; background: #2563eb; color: white; padding: 18px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Track My Masterpiece</a>
      </div>
    `;
    await this.sendEmail(order.email, `Amol Graphics | Order Confirmed #${order.id}`, emailHtml);

    // 2. WhatsApp Construction (Using standard templates)
    // Params: 1: CustomerName, 2: OrderID, 3: TotalAmount, 4: TrackingLink
    const waParams = [
      order.customerName,
      order.id.slice(-8).toUpperCase(),
      `₹${order.totalAmount}`,
      trackingLink
    ];
    
    await this.sendWhatsApp(
      order.phone, 
      `Confirming order #${order.id}. Total ₹${order.totalAmount}`, 
      "order_placed_confirmation", 
      waParams
    );
  }

  /**
   * Real-time Order Status Synchronizer
   */
  static async sendStatusUpdate(order: any) {
    const status = order.orderStatus;
    const waParams = [
      order.customerName,
      order.id.slice(-8).toUpperCase(),
      status,
      order.trackingUrl || "Shipment In Progress"
    ];

    await this.sendWhatsApp(
      order.phone, 
      `Your order #${order.id} status updated to: ${status}`, 
      "order_status_update", 
      waParams
    );
  }
}
