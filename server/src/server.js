import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import influencerRoutes from './routes/influencerRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import authRoutes from './routes/authRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { initDefaultUsers } from './controllers/authController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares - Support image uploads (slips and avatars) via base64
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes (Mount on both /api/* and root /* for bulletproof frontend-backend compatibility)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/influencers', '/influencers'], influencerRoutes);
app.use(['/api/articles', '/articles'], articleRoutes);
app.use(['/api/deals', '/deals'], dealRoutes);
app.use(['/api/budget', '/budget'], budgetRoutes);
app.use(['/api/settings', '/settings'], settingsRoutes);
app.use(['/api/backup', '/backup'], backupRoutes);
app.use(['/api/upload', '/upload'], uploadRoutes);

// Health check
app.get(['/api/health', '/health', '/'], (req, res) => {
  res.json({ status: 'ok', service: 'AmmarDev Influencer CRM Backend', timestamp: new Date() });
});

// Connect to DB and Start Server
connectDB().then(async () => {
  await initDefaultUsers();
  app.listen(PORT, () => {
    console.log(`[AmmarDev Server] running on http://localhost:${PORT}`);
  });
});
