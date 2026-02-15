import express from "express";
import {
  getTopTools,
  getTopReagents,
  getCatalogTools,
  getCatalogReagents
} from "../controllers/catalog.controller.js";

const router = express.Router();

router.get("/top-tools", getTopTools);
router.get("/top-reagents", getTopReagents);
router.get("/tools", getCatalogTools);
router.get("/reagents", getCatalogReagents);

export default router;