import express from "express";
import {
  getAllRequests,
  getRequestById,
  searchRequests,
  approveRequest,
  rejectRequest,
  cancelRequest,
  getRequestStats,
  createRequest,
  updatePaymentStatus,
  handleMidtransNotification
} from "../controllers/requests.controller.js";

const router = express.Router();

// CREATE
router.post("/", createRequest);
router.post("/midtrans/notification", handleMidtransNotification);

// READ
router.get("/", getAllRequests);
router.get("/stats", getRequestStats);
router.get("/search", searchRequests);
router.get("/:id", getRequestById);

// UPDATE
router.put("/:id/approve", approveRequest);
router.put("/:id/reject", rejectRequest);
router.put("/:id/cancel", cancelRequest);
router.put("/payment/status", updatePaymentStatus);

export default router;