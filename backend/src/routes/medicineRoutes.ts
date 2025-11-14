import express from "express";
import {createMedicine, getMedicines, updateMedicine, deleteMedicine,} from "../controllers/medicineController";

const router = express.Router();

// =======================
// 📦 Medicine Routes
// =======================

// Create new medicine
router.post("/", createMedicine);

// Get all medicines
router.get("/", getMedicines);

// Update existing medicine by ID
router.put("/:id", updateMedicine);

// Delete medicine by ID
router.delete("/:id", deleteMedicine);

export default router;
