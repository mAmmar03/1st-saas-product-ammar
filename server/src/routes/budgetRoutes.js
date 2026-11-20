import express from 'express';
import { getBudgetOverview, setBudget, deleteBudget } from '../controllers/budgetController.js';
import { requireAuth, requireSuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getBudgetOverview);
router.post('/set', requireSuperAdmin, setBudget);
router.delete('/:id', requireSuperAdmin, deleteBudget);

export default router;
