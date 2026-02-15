import express from "express";
import {
  getAllPayments,
  getPaymentById,
  searchPayments,
  updatePaymentStatus,
  getPaymentStats
} from "../controllers/payments.controller.js";

const router = express.Router();

// READ
router.get("/", getAllPayments);
router.get("/stats", getPaymentStats);
router.get("/search", searchPayments);
router.get("/:id", getPaymentById);

// UPDATE
router.put("/:id/status", updatePaymentStatus);

export default router;