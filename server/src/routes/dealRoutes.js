import express from 'express';
import {
  getDeals,
  createDeal,
  dispatchPRArticle,
  markPRDelivered,
  revertPRDispatch,
  updateVideoDeliverable,
  updatePayment,
  deleteDeal,
  getDashboardStats,
} from '../controllers/dealController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getDeals);
router.get('/dashboard-stats', getDashboardStats);
router.post('/', createDeal);
router.patch('/:dealId/pr/:prItemId/dispatch', dispatchPRArticle);
router.patch('/:dealId/pr/:prItemId/deliver', markPRDelivered);
router.patch('/:dealId/pr/:prItemId/revert', revertPRDispatch);
router.patch('/:dealId/videos/:videoId', updateVideoDeliverable);
router.patch('/:dealId/payment', updatePayment);
router.delete('/:id', deleteDeal);

export default router;
