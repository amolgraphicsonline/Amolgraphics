import express from "express";
import { 
  getBanners, createBanner, updateBanner, deleteBanner, getAllBanners, getBannerByCategory 
} from "../controllers/bannerController";

const router = express.Router();

// Public route to fetch active banners
router.get("/", getBanners);

// Protected routes for admin management
router.get("/all", getAllBanners);
router.get("/category/:categoryId", getBannerByCategory);
router.post("/", createBanner);
router.put("/:id", updateBanner);
router.delete("/:id", deleteBanner);

export default router;
