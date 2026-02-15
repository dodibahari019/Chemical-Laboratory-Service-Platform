import express from 'express';
import {
    createRequest,
    addToolToRequest,
    addReagentToRequest,
    getMyRequests
} from "../controllers/RequestController.js";
import { verifyToken } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

router.post("/", verifyToken, createRequest);
router.post("/:id/tools", verifyToken, addToolToRequest);
router.post("/:id/reagents", verifyToken, addReagentToRequest);
router.get("/  ", verifyToken, getMyRequests);

export default router;