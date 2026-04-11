import { Router } from "express";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "../controllers/couponController";

const router = Router();

router.get("/", getCoupons);
router.post("/", createCoupon);
router.patch("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router;
