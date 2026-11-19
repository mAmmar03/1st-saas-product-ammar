import Influencer from '../models/Influencer.js';
import Article from '../models/Article.js';
import Deal from '../models/Deal.js';
import BrandProfile from '../models/BrandProfile.js';

// Export complete system data
export const exportAllData = async (req, res) => {
  try {
    const influencers = await Influencer.find();
    const articles = await Article.find();
    const deals = await Deal.find();
    const brandProfile = await BrandProfile.findOne();

    const backupPayload = {
      system: 'AmmarDev Influencer CRM & PR Tracking System',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      counts: {
        influencers: influencers.length,
        articles: articles.length,
        deals: deals.length,
      },
      data: {
        influencers,
        articles,
        deals,
        brandProfile,
      },
    };

    res.json(backupPayload);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export backup: ' + error.message });
  }
};

// Import system data
export const importAllData = async (req, res) => {
  try {
    const { data, mode = 'overwrite' } = req.body;

    if (!data || (!data.influencers && !data.articles && !data.deals)) {
      return res.status(400).json({ error: 'Invalid backup format. Missing core collections.' });
    }

    if (mode === 'overwrite') {
      await Promise.all([
        Influencer.deleteMany({}),
        Article.deleteMany({}),
        Deal.deleteMany({}),
        BrandProfile.deleteMany({}),
      ]);
    }

    if (data.brandProfile) {
      await BrandProfile.create(data.brandProfile);
    }

    if (Array.isArray(data.influencers) && data.influencers.length > 0) {
      await Influencer.insertMany(data.influencers);
    }

    if (Array.isArray(data.articles) && data.articles.length > 0) {
      await Article.insertMany(data.articles);
    }

    if (Array.isArray(data.deals) && data.deals.length > 0) {
      await Deal.insertMany(data.deals);
    }

    res.json({
      message: 'System data imported successfully',
      imported: {
        influencers: data.influencers?.length || 0,
        articles: data.articles?.length || 0,
        deals: data.deals?.length || 0,
        brandProfile: Boolean(data.brandProfile),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import data: ' + error.message });
  }
};
