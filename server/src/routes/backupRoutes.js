import express from 'express';
import { exportAllData, importAllData } from '../controllers/backupController.js';
import { requireAuth, requireSuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireSuperAdmin);

router.get('/export', exportAllData);
router.post('/import', importAllData);

export default router;
