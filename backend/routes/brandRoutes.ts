import express from "express";
import { getBrands, createBrand } from "../controllers/brandController";

const router = express.Router();

router.get("/", getBrands);
router.post("/", createBrand);

export default router;
