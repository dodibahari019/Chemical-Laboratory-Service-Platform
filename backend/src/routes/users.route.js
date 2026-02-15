import express from "express";
import {
  getAllUsers,
  getUserById,
  searchUsers,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/users.controller.js";

const router = express.Router();

// READ
router.get("/", getAllUsers);                 // GET ALL
router.get("/search", searchUsers);            // SEARCH
router.get("/:id", getUserById);               // GET BY ID

// WRITE
router.post("/", createUser);                  // INSERT
router.put("/:id", updateUser);                // UPDATE
router.delete("/:id", deleteUser);              // DELETE (soft)

export default router;
