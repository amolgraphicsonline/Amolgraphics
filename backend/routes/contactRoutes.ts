import { Router } from "express";
import { createMessage, getAllMessages, updateMessageStatus, deleteMessage } from '../controllers/contactController';

const router = Router();

// Public route to send message
router.post('/', createMessage);

// Admin routes
router.get('/', getAllMessages);
router.patch('/:id/status', updateMessageStatus);
router.delete('/:id', deleteMessage);

export default router;
