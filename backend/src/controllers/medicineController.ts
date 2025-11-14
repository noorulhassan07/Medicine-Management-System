import { Request, Response } from "express";
import Medicine from "../models/Medicine";
import { CreateMedicineDTO, UpdateMedicineDTO } from "../types/Medicine";

// ====================================================
// Create a new medicine
// ====================================================
export const createMedicine = async (req: Request, res: Response) => {
  try {
    const {
      name,
      quantity,
      manufacturingDate,
      expiryDate,
      dateOfEntry,
      price,
    }: CreateMedicineDTO = req.body;

    // Validation
    if (
      !name ||
      quantity == null ||
      !manufacturingDate ||
      !expiryDate ||
      !dateOfEntry
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const med = new Medicine({
      name,
      quantity,
      manufacturingDate: new Date(manufacturingDate),
      expiryDate: new Date(expiryDate),
      dateOfEntry: new Date(dateOfEntry),
      price,
    });

    const saved = await med.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error creating medicine:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ====================================================
// Get all medicines
// ====================================================
export const getMedicines = async (req: Request, res: Response) => {
  try {
    const list = await Medicine.find().sort({ dateOfEntry: -1 });
    return res.json(list);
  } catch (err) {
    console.error("❌ Error fetching medicines:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ====================================================
// Update an existing medicine
// ====================================================
export const updateMedicine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateMedicineDTO = req.body;

    const updated = await Medicine.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("❌ Error updating medicine:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ====================================================
// Delete a medicine
// ====================================================
export const deleteMedicine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Medicine.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    return res.json({ message: "Medicine deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting medicine:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
