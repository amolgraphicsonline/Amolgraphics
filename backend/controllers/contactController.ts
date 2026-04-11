import { Request, Response } from 'express';
import prisma from "../lib/prisma";

export const createMessage = async (req: any, res: any) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone,
        subject,
        message
      }
    });
    res.status(201).json(newMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllMessages = async (req: any, res: any) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMessageStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status }
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessage = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.contactMessage.delete({
      where: { id }
    });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
