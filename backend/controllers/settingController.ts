import { Request, Response } from "express";
import prisma from "../lib/prisma";
import logger from "../lib/logger";

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.storeSettings.findFirst();
    
    // If no settings exist, create default
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: "default",
          storeName: "AmolGraphics",
          subHeadline: "THE STUDIO COLLECTIVE",
          logoHeight: 100,
          showStoreNameInHeader: true,
          storeNameFont: "Inter",
          storeNameSize: 24
        }
      });
    }
    
    res.json(settings);
  } catch (error: any) {
    logger.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { 
      storeName, logo, logoHeight, showStoreNameInHeader, storeNameFont, storeNameSize, subHeadline,
      whatsappProvider, whatsappApiKey, 
      whatsappInstanceId, whatsappFromNumber, whatsappNumber, 
      smsEnabled, emailEnabled, orderNotificationEmail,
      instagramUrl, facebookUrl, linkedinUrl, youtubeUrl, 
      contactEmail, contactPhone, contactAddress,
      paymentSandboxMode, razorpayKeyId, razorpayKeySecret,
      defaultShippingFee, taxInclusive, taxRate,
      googleMapsApiKey, googlePlaceId
    } = req.body;
    
    let settings = await prisma.storeSettings.findFirst();
    
    const settingsData = {
      storeName,
      logo,
      logoHeight: parseInt(String(logoHeight || 100)),
      showStoreNameInHeader: Boolean(showStoreNameInHeader),
      storeNameFont: String(storeNameFont || "Inter"),
      storeNameSize: parseInt(String(storeNameSize || 24)),
      subHeadline,
      whatsappProvider,
      whatsappApiKey,
      whatsappInstanceId,
      whatsappFromNumber,
      whatsappNumber,
      smsEnabled,
      emailEnabled,
      orderNotificationEmail,
      instagramUrl,
      facebookUrl,
      linkedinUrl,
      youtubeUrl,
      contactEmail,
      contactPhone,
      contactAddress,
      paymentSandboxMode,
      razorpayKeyId,
      razorpayKeySecret,
      defaultShippingFee: parseFloat(String(defaultShippingFee || 0)),
      taxInclusive: taxInclusive !== undefined ? Boolean(taxInclusive) : true,
      taxRate: parseFloat(String(taxRate !== undefined ? taxRate : 18.0)),
      googleMapsApiKey,
      googlePlaceId
    };
    
    if (settings) {
      settings = await (prisma.storeSettings as any).update({
        where: { id: settings.id },
        data: settingsData
      });
    } else {
      settings = await (prisma.storeSettings as any).create({
        data: {
          id: "default",
          ...settingsData
        }
      });
    }
    
    res.json(settings);
  } catch (error: any) {
    logger.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
};
