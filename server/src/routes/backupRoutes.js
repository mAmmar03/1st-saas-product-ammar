import express from 'express';
import { exportAllData, importAllData } from '../controllers/backupController.js';

const router = express.Router();

router.get('/export', exportAllData);
router.post('/import', importAllData);

export default router;
