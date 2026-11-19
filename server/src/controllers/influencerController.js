import Influencer from '../models/Influencer.js';
import Deal from '../models/Deal.js';

// Get all influencers
export const getInfluencers = async (req, res) => {
  try {
    const influencers = await Influencer.find().sort({ createdAt: -1 });
    res.json(influencers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get influencer dossier / complete bio-data file
export const getInfluencerDossier = async (req, res) => {
  try {
    const { id } = req.params;
    const influencer = await Influencer.findById(id);
    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    // Fetch all deals/collaborations of this influencer
    const deals = await Deal.find({ influencer: id })
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

// Create new influencer
export const createInfluencer = async (req, res) => {
  try {
    const existing = await Influencer.findOne({ instagramHandle: req.body.instagramHandle });
    if (existing) {
      return res.status(400).json({ error: 'Influencer with this Instagram handle already exists' });
    }
    const influencer = new Influencer(req.body);
    await influencer.save();
    res.status(201).json(influencer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update influencer
export const updateInfluencer = async (req, res) => {
  try {
    const influencer = await Influencer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!influencer) return res.status(404).json({ error: 'Influencer not found' });
    res.json(influencer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete influencer
export const deleteInfluencer = async (req, res) => {
  try {
    const influencer = await Influencer.findByIdAndDelete(req.params.id);
    if (!influencer) return res.status(404).json({ error: 'Influencer not found' });
    res.json({ message: 'Influencer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
