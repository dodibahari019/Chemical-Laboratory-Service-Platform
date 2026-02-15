import express from "express";
import {
  getAllSchedules,
  getScheduleById,
  searchSchedules,
  getSchedulesByDate,
  updateScheduleStatus,
  getScheduleStats
} from "../controllers/schedules.controller.js";

const router = express.Router();

// READ
router.get("/", getAllSchedules);
router.get("/stats", getScheduleStats);
router.get("/search", searchSchedules);
router.get("/by-date", getSchedulesByDate);
router.get("/:id", getScheduleById);

// UPDATE
router.put("/:id/status", updateScheduleStatus);

export default router;