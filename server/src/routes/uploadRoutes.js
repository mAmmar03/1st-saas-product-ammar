import express from 'express';
import cloudinary from '../config/cloudinary.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/upload/image
 * Uploads base64 or remote image to Cloudinary CDN
 * Isolated per workspace in Cloudinary:
 * ammardev_crm/workspaces/{workspaceId}/{folder}
 */
router.post('/image', requireAuth, async (req, res) => {
  try {
    const { image, folder = 'assets' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided for upload' });
    }

    if (!process.env.CLOUDINARY_API_SECRET) {
      return res.status(503).json({
        error: 'Cloudinary API Secret is not configured yet. Please add CLOUDINARY_API_SECRET in server .env.',
      });
    }

    const wsId = req.user?.workspaceId ? String(req.user.workspaceId) : 'common';
    const cleanSub = folder.replace(/^[\/\\]+|[\/\\]+$/g, '');
    const isolatedCloudinaryFolder = `ammardev_crm/workspaces/${wsId}/${cleanSub}`;

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: isolatedCloudinaryFolder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    res.json({
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      format: uploadResponse.format,
      bytes: uploadResponse.bytes,
      folder: isolatedCloudinaryFolder,
    });
  } catch (err) {
    console.error('[Cloudinary Upload Error]:', err);
    res.status(500).json({
      error: err.message || 'Failed to upload image to Cloudinary CDN',
    });
  }
});

export default router;
