import express from "express";
import { backendCheck, databaseTest } from '../controllers/DbTestController.js';

const router = express.Router();

router.get('/backend-check', backendCheck);
router.get('/database-test', databaseTest);

export default router;