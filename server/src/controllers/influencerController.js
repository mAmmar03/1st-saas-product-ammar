import Influencer from '../models/Influencer.js';
import Deal from '../models/Deal.js';

// Get all influencers (Scoped to workspace)
export const getInfluencers = async (req, res) => {
  try {
    const influencers = await Influencer.find({ workspaceId: req.user.workspaceId }).sort({ createdAt: -1 });
    res.json(influencers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get influencer dossier / complete bio-data file (Scoped to workspace)
export const getInfluencerDossier = async (req, res) => {
  try {
    const { id } = req.params;
    const influencer = await Influencer.findOne({ _id: id, workspaceId: req.user.workspaceId });
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found in your workspace' });
    }

    // Fetch all deals/collaborations of this influencer in this workspace
    const deals = await Deal.find({ influencer: id, workspaceId: req.user.workspaceId })
      .populate('prArticles.article', 'name articleCode category')
      .sort({ agreedDate: -1 });

    // Aggregate statistics for bio-data
    let totalCollaborations = deals.length;
    let totalAgreedValue = 0;
    let totalPaidValue = 0;
    let totalArticlesReceived = 0;
    let articlesList = [];
    let videosDelivered = 0;
    let videosPending = 0;
    let allVideos = [];

    deals.forEach((deal) => {
      totalAgreedValue += deal.agreedRate || 0;
      totalPaidValue += deal.payment?.advancePaid || 0;

      // Collect PR articles
      deal.prArticles.forEach((item) => {
        if (item.dispatchStatus === 'Dispatched' || item.dispatchStatus === 'Delivered') {
          totalArticlesReceived += item.quantity || 1;
        }
        articlesList.push({
          dealCampaign: deal.campaignName,
          articleName: item.article?.name || 'Unknown Article',
          articleCode: item.article?.articleCode || 'N/A',
          quantity: item.quantity,
          dispatchStatus: item.dispatchStatus,
          dispatchDate: item.dispatchDate,
          trackingNumber: item.trackingNumber,
        });
      });

      // Collect videos
      deal.videos.forEach((video) => {
        if (video.status === 'Video Live') {
          videosDelivered++;
        } else {
          videosPending++;
        }
        allVideos.push({
          campaign: deal.campaignName,
          videoType: video.videoType,
          scheduledDate: video.scheduledDate,
          status: video.status,
          liveUrl: video.liveUrl,
          deliveredDate: video.deliveredDate,
        });
      });
    });

    res.json({
      profile: influencer,
      stats: {
        totalCollaborations,
        totalAgreedValue,
        totalPaidValue,
        totalPendingPayment: Math.max(0, totalAgreedValue - totalPaidValue),
        totalArticlesReceived,
        videosDelivered,
        videosPending,
      },
      deals,
      articlesList,
      allVideos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new influencer (Scoped to workspace)
export const createInfluencer = async (req, res) => {
  try {
    const handle = req.body.instagramHandle ? req.body.instagramHandle.trim().toLowerCase() : '';
    const existing = await Influencer.findOne({
      workspaceId: req.user.workspaceId,
      instagramHandle: { $regex: new RegExp(`^${handle}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({ error: 'An influencer with this handle already exists in your workspace' });
    }

    const influencer = new Influencer({
      ...req.body,
      workspaceId: req.user.workspaceId,
    });

    await influencer.save();
    res.status(201).json(influencer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update influencer (Scoped to workspace)
export const updateInfluencer = async (req, res) => {
  try {
    const influencer = await Influencer.findOneAndUpdate(
      { _id: req.params.id, workspaceId: req.user.workspaceId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!influencer) return res.status(404).json({ error: 'Influencer not found in your workspace' });
    res.json(influencer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete influencer (Scoped to workspace)
export const deleteInfluencer = async (req, res) => {
  try {
    const influencer = await Influencer.findOneAndDelete({
      _id: req.params.id,
      workspaceId: req.user.workspaceId,
    });
    if (!influencer) return res.status(404).json({ error: 'Influencer not found in your workspace' });
    res.json({ message: 'Influencer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
