import { Router } from "express";
import { 
  createOrder,
  listOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder, verifyPayment
} from "../controllers/orderController";

const router = Router();

router.post("/", createOrder);
router.get("/", listOrders);
router.post("/verify", verifyPayment);
router.get("/:id", getOrderById);
router.patch("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);

export default router;
