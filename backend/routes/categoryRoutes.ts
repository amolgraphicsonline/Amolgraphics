import express from "express";
import { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  addCategoryAttribute, 
  addAttributeOption,
  deleteCategoryAttribute,
  deleteAttributeOption,
  reorderCategories,
  updateCategoryAttribute,
  updateAttributeOption
} from "../controllers/categoryController";

const router = express.Router();
// Fresh architectural routes for Category Matrix

router.get("/", getCategories);
router.post("/reorder", reorderCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategory);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);

router.post("/:categoryId/attributes", addCategoryAttribute);
router.delete("/attributes/:id", deleteCategoryAttribute);

router.patch("/attributes/:id", updateCategoryAttribute);

router.post("/attributes/:attributeId/options", addAttributeOption);
router.patch("/options/:id", updateAttributeOption);
router.delete("/options/:id", deleteAttributeOption);

export default router;
