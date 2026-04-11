import express from "express";
import {
  getProductDesigns,
  getAllProductDesigns,
  createProductDesign,
  updateProductDesign,
  deleteProductDesign,
  getProductDesignById,
} from "../controllers/productDesignController";

const router = express.Router();

router.get("/", getProductDesigns);           // Public: active designs by category
router.get("/all", getAllProductDesigns);      // Admin: all designs
router.get("/:id", getProductDesignById);     // Public: get specific design
router.post("/", createProductDesign);        // Admin: create
router.patch("/:id", updateProductDesign);    // Admin: update / toggle
router.delete("/:id", deleteProductDesign);   // Admin: delete

export default router;
