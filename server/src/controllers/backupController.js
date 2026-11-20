import Influencer from '../models/Influencer.js';
import Article from '../models/Article.js';
import Deal from '../models/Deal.js';
import BrandProfile from '../models/BrandProfile.js';

// Export complete system data for the current workspace
export const exportAllData = async (req, res) => {
  try {
    const wsId = req.user.workspaceId;
    const influencers = await Influencer.find({ workspaceId: wsId });
    const articles = await Article.find({ workspaceId: wsId });
    const deals = await Deal.find({ workspaceId: wsId });
    const brandProfile = await BrandProfile.findOne({ workspaceId: wsId });

    const backupPayload = {
      system: 'AmmarDev Influencer CRM & PR Tracking System',
      version: '2.0.0-multi-tenant',
      workspaceId: wsId,
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

// Import system data (Scoped strictly to current workspace)
export const importAllData = async (req, res) => {
  try {
    const wsId = req.user.workspaceId;
    const { data, mode = 'overwrite' } = req.body;

    if (!data || (!data.influencers && !data.articles && !data.deals)) {
      return res.status(400).json({ error: 'Invalid backup format. Missing core collections.' });
    }

    if (mode === 'overwrite') {
      await Promise.all([
        Influencer.deleteMany({ workspaceId: wsId }),
        Article.deleteMany({ workspaceId: wsId }),
        Deal.deleteMany({ workspaceId: wsId }),
      ]);
    }

    // Insert influencers with workspaceId
    if (data.influencers && data.influencers.length > 0) {
      const cleanInfluencers = data.influencers.map((inf) => {
        const { _id, ...rest } = inf;
        return { ...rest, workspaceId: wsId };
      });
      await Influencer.insertMany(cleanInfluencers);
    }

    // Insert articles with workspaceId
    if (data.articles && data.articles.length > 0) {
      const cleanArticles = data.articles.map((art) => {
        const { _id, ...rest } = art;
        return { ...rest, workspaceId: wsId };
      });
      await Article.insertMany(cleanArticles);
    }

    // Insert deals with workspaceId
    if (data.deals && data.deals.length > 0) {
      const cleanDeals = data.deals.map((deal) => {
        const { _id, ...rest } = deal;
        return { ...rest, workspaceId: wsId };
      });
      await Deal.insertMany(cleanDeals);
    }

    // Restore brand profile if provided
    if (data.brandProfile) {
      const { _id, ...restProfile } = data.brandProfile;
      await BrandProfile.findOneAndUpdate(
        { workspaceId: wsId },
        { ...restProfile, workspaceId: wsId },
        { upsert: true, new: true }
      );
    }

    res.json({
      message: 'Workspace data restored successfully!',
      mode,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import backup: ' + error.message });
  }
};
