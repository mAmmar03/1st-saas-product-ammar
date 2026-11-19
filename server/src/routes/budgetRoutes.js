import express from 'express';
import {
  getBudgetOverview,
  setBudget,
  deleteBudget,
} from '../controllers/budgetController.js';
import { requireAuth, requireSuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get budget overview (authenticated users with permission or super_admin)
router.get('/', requireAuth, getBudgetOverview);

// Set or update budget (Super Admin ONLY)
router.post('/', requireAuth, requireSuperAdmin, setBudget);

// Delete budget (Super Admin ONLY)
router.delete('/:id', requireAuth, requireSuperAdmin, deleteBudget);

export default router;
