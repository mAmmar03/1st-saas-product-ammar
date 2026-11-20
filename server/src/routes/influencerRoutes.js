import express from 'express';
import {
  getInfluencers,
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
  getInfluencerDossier,
} from '../controllers/influencerController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getInfluencers);
router.get('/:id/dossier', getInfluencerDossier);
router.post('/', createInfluencer);
router.put('/:id', updateInfluencer);
router.delete('/:id', deleteInfluencer);

export default router;
