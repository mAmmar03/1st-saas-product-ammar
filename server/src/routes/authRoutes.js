import express from 'express';
import {
  register,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  setSuperAdminPassword,
  createAdmin,
  manageAdminAccount,
  deleteAdminAccount,
  getUsersList,
} from '../controllers/authController.js';
import { requireAuth, requireSuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public auth routes
router.post('/register', register);
router.post('/signup', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Authenticated user routes
router.get('/me', requireAuth, getMe);

// Super Admin exclusive routes (scoped strictly to Super Admin workspace)
router.get('/users', requireAuth, requireSuperAdmin, getUsersList);
router.post('/set-superadmin-password', requireAuth, requireSuperAdmin, setSuperAdminPassword);
router.post('/create-admin', requireAuth, requireSuperAdmin, createAdmin);
router.post('/manage-admin', requireAuth, requireSuperAdmin, manageAdminAccount);
router.delete('/users/:id', requireAuth, requireSuperAdmin, deleteAdminAccount);

export default router;
