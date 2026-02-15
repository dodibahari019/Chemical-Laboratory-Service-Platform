import express from 'express';
import passport from '../config/passport.js';
import * as authController from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { registerValidator, loginValidator, staffLoginValidator } from '../validator/auth.validator.js';

const router = express.Router();

// ========== CUSTOMER ROUTES ==========
// Register
router.post('/register', registerValidator, authController.registerManual);

// Login (Email based)
router.post('/login', loginValidator, authController.loginManual);

// Check email
router.get('/check-email', authController.checkEmail);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/google/failure',
  }),
  authController.googleAuthSuccess
);

router.get('/google/failure', authController.googleAuthFailure);

// ========== STAFF/EMPLOYEE ROUTES ==========
// Staff Login (Username based)
router.post('/staff/login', staffLoginValidator, authController.loginStaff);

// ========== COMMON ROUTES ==========
// Get current user
router.get('/me', authMiddleware, authController.getCurrentUser);

// Get user info (untuk navbar)
router.get('/user-info', authMiddleware, authController.getUserInfo);

// Logout
router.post('/logout', authMiddleware, authController.logout);

export default router;