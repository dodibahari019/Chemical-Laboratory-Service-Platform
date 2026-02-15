import express from "express";
import {
  getAllReagents,
  getReagentById,
  searchReagents,
  createReagent,
  updateReagent,
  deleteReagent,
  upload,
  uploadExcel,
  downloadTemplate,
  importReagentsFromExcel
} from "../controllers/reagents.controller.js";

const router = express.Router();

// READ
router.get("/", getAllReagents);
router.get("/search", searchReagents);
router.get("/:id", getReagentById);

// WRITE
router.post("/", upload.single('foto'), createReagent);
router.put("/:id", upload.single('foto'), updateReagent);
router.delete("/:id", deleteReagent);

// Excel import routes
router.get('/template/download', downloadTemplate);
router.post('/import/excel', uploadExcel.single('file'), importReagentsFromExcel);

export default router;