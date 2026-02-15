import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import * as customerController from '../controllers/customer.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Dashboard
router.get('/dashboard/stats', customerController.getDashboardStats);
router.get('/dashboard/recent-requests', customerController.getRecentRequests);
router.get('/dashboard/upcoming-schedules', customerController.getUpcomingSchedules);

// My Requests
router.get('/requests', customerController.getAllMyRequests);
router.get('/requests/:id', customerController.getRequestDetail);
router.put('/requests/:id/cancel', customerController.cancelRequest);

// Notifications
router.get('/notifications', customerController.getNotifications);
router.put('/notifications/:id/read', customerController.markNotificationAsRead);

export default router;