import express from "express";
import {
    getReagents,
    getReagentById,
    createReagent,
    updateReagent,
    deleteReagent
} from "../controllers/ReagentController.js";

import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, authorizeRoles("admin", "staff"), getReagents);
router.get("/:id", verifyToken, authorizeRoles("admin", "staff"), getReagentById);

router.post("/", verifyToken, authorizeRoles("admin"), createReagent);
router.put("/:id", verifyToken, authorizeRoles("admin", "staff"), updateReagent);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteReagent);

export default router;