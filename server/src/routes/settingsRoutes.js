import express from 'express';
import { getBrandProfile, updateBrandProfile } from '../controllers/settingsController.js';

const router = express.Router();

router.get('/brand', getBrandProfile);
router.put('/brand', updateBrandProfile);

export default router;
