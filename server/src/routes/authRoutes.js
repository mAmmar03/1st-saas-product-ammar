import express from 'express';
import {
  register,
  login,
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
router.post('/login', login);

// Authenticated user routes
router.get('/me', requireAuth, getMe);

// Super Admin exclusive routes
router.get('/users', requireAuth, requireSuperAdmin, getUsersList);
router.post('/set-superadmin-password', requireAuth, requireSuperAdmin, setSuperAdminPassword);
router.post('/create-admin', requireAuth, requireSuperAdmin, createAdmin);
router.post('/manage-admin', requireAuth, requireSuperAdmin, manageAdminAccount);
router.delete('/users/:id', requireAuth, requireSuperAdmin, deleteAdminAccount);

export default router;
