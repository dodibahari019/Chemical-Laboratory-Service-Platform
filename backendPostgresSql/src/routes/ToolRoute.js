import express from "express";
import { 
    getTools,
    getToolById,
    createTool,
    updateTool,
    deleteTool
} from "../controllers/ToolController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, authorizeRoles("admin", "staff"), getTools);
router.get("/:id", verifyToken, authorizeRoles("admin", "staff"), getToolById);

router.post("/", verifyToken, authorizeRoles("admin"), createTool);
router.put("/:id", verifyToken, authorizeRoles("admin", "staff"), updateTool);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteTool);

export default router;