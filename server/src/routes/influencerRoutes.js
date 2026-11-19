import express from 'express';
import {
  getInfluencers,
  getInfluencerDossier,
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
} from '../controllers/influencerController.js';

const router = express.Router();

router.get('/', getInfluencers);
router.get('/:id/dossier', getInfluencerDossier);
router.post('/', createInfluencer);
router.put('/:id', updateInfluencer);
router.delete('/:id', deleteInfluencer);

export default router;
