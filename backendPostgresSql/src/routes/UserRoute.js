import express from "express";
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from "../controllers/UserController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/profile", verifyToken, (req, res) => {
    res.json(req.user)
});
router.get("/", verifyToken, authorizeRoles("admin", "staff"), getUsers);
router.get("/:id", verifyToken, authorizeRoles("admin"), getUserById);
router.post("/", verifyToken, authorizeRoles("admin"), createUser);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateUser);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteUser);

export default router;