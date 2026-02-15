import express from 'express';
import * as toolsController from '../controllers/tools.controller.js';

const router = express.Router();

// Regular routes
router.get('/', toolsController.getAllTools);
router.get('/search', toolsController.searchTools);
router.get('/:id', toolsController.getToolById);

// Create with image upload
router.post('/', toolsController.upload.single('image'), toolsController.createTool);

// Update with image upload
router.put('/:id', toolsController.upload.single('image'), toolsController.updateTool);

// Delete
router.delete('/:id', toolsController.deleteTool);

// Excel import routes
router.get('/template/download', toolsController.downloadTemplate);
router.post('/import/excel', toolsController.uploadExcel.single('file'), toolsController.importToolsFromExcel);

export default router;