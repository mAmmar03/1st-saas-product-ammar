import express from 'express';
import { getBrandProfile, updateBrandProfile } from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getBrandProfile);
router.put('/', updateBrandProfile);

export default router;
