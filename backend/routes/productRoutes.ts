import express from "express";
import multer from "multer";
import { 
  getProducts, getProductById, getProductBySlug, createProduct, updateProduct, 
  deleteProduct, bulkDeleteProducts, addVariant, deleteVariant, duplicateProduct,
  exportProducts, importProducts
} from "../controllers/productController";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getProducts);
router.get("/export", exportProducts);
router.post("/import", upload.single("file"), importProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.post("/:id/duplicate", duplicateProduct);
router.delete("/:id", deleteProduct);
router.post("/bulk-delete", bulkDeleteProducts);
router.post("/:productId/variants", addVariant);
router.delete("/variants/:id", deleteVariant);

export default router;
