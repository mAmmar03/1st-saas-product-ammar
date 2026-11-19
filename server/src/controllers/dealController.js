import Deal from '../models/Deal.js';
import Article from '../models/Article.js';
import Influencer from '../models/Influencer.js';

// Get all deals with populated fields
export const getDeals = async (req, res) => {
  try {
    const deals = await Deal.find()
      .populate('influencer')
      .populate('prArticles.article')
      .sort({ createdAt: -1 });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new deal / collaboration
export const createDeal = async (req, res) => {
  try {
    const {
      spNumber,
      influencer,
      campaignName,
      dealType = 'Paid Collab',
      agreedDate,
      agreedRate,
      ratePerVideo,
      prArticles,
      videos,
      pastDealNotes,
    } = req.body;

    const isBarter = dealType === 'Barter PR';
    const finalRate = isBarter ? 0 : Number(agreedRate || 0);
    const finalRatePerVideo = isBarter ? 0 : Number(ratePerVideo || 0);

    const newDeal = new Deal({
      spNumber: spNumber || '',
      influencer,
      campaignName: campaignName || (isBarter ? 'Barter PR Collaboration' : 'PR Collaboration'),
      dealType: isBarter ? 'Barter PR' : 'Paid Collab',
      agreedDate: agreedDate || new Date(),
      agreedRate: finalRate,
      ratePerVideo: finalRatePerVideo,
      prArticles: prArticles || [],
      videos: videos || [],
      pastDealNotes: pastDealNotes || '',
      payment: {
        totalAmount: finalRate,
        advancePaid: 0,
        remainingAmount: finalRate,
        status: isBarter ? 'Barter (No Fee)' : 'Unpaid',
      },
    });

    await newDeal.save();
    const populated = await Deal.findById(newDeal._id)
      .populate('influencer')
      .populate('prArticles.article');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Dispatch a PR article and deduct stock
export const dispatchPRArticle = async (req, res) => {
  try {
    const { dealId, prItemId } = req.params;
    const { courierName, trackingNumber, deliveryNotes, spNumber } = req.body;

    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const prItem = deal.prArticles.id(prItemId);
    if (!prItem) return res.status(404).json({ error: 'PR item not found in this deal' });

    // Check if already dispatched
    if (prItem.dispatchStatus === 'Dispatched' || prItem.dispatchStatus === 'Delivered') {
      return res.status(400).json({ error: 'This PR item has already been dispatched' });
    }

    const article = await Article.findById(prItem.article);
    if (!article) return res.status(404).json({ error: 'Article not found in inventory' });

    // Check available stock
    if (article.remainingPieces < prItem.quantity) {
      return res.status(400).json({
        error: `Insufficient stock! Only ${article.remainingPieces} pieces left for article "${article.name}". (Requested: ${prItem.quantity})`,
      });
    }

    // Atomic Stock Deduction
    article.sentPieces += prItem.quantity;
    article.remainingPieces = Math.max(0, article.totalPRQuota - article.sentPieces);
    await article.save();

    // Update PR item status in deal
    prItem.dispatchStatus = 'Dispatched';
    prItem.dispatchDate = new Date();
    prItem.courierName = courierName || 'TCS Courier';
    prItem.trackingNumber = trackingNumber || '';
    prItem.deliveryNotes = deliveryNotes || '';

    if (spNumber && !deal.spNumber) {
      deal.spNumber = spNumber;
    }

    await deal.save();

    const updatedDeal = await Deal.findById(dealId)
      .populate('influencer')
      .populate('prArticles.article');

    res.json({
      message: `Successfully dispatched ${prItem.quantity} pc(s) of ${article.name}. Stock deducted!`,
      deal: updatedDeal,
      article,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark PR item as delivered
export const markPRDelivered = async (req, res) => {
  try {
    const { dealId, prItemId } = req.params;
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const prItem = deal.prArticles.id(prItemId);
    if (!prItem) return res.status(404).json({ error: 'PR item not found' });

    prItem.dispatchStatus = 'Delivered';
    await deal.save();

    const updatedDeal = await Deal.findById(dealId)
      .populate('influencer')
      .populate('prArticles.article');

    res.json({ message: 'Marked as Delivered', deal: updatedDeal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Revert a dispatched PR article back to pending (restores stock)
export const revertPRDispatch = async (req, res) => {
  try {
    const { dealId, prItemId } = req.params;
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const prItem = deal.prArticles.id(prItemId);
    if (!prItem) return res.status(404).json({ error: 'PR item not found' });

    if (prItem.dispatchStatus === 'Pending') {
      return res.status(400).json({ error: 'PR item is already pending' });
    }

    const article = await Article.findById(prItem.article);
    if (article) {
      article.sentPieces = Math.max(0, article.sentPieces - prItem.quantity);
      article.remainingPieces = Math.max(0, article.totalPRQuota - article.sentPieces);
      await article.save();
    }

    prItem.dispatchStatus = 'Pending';
    prItem.dispatchDate = null;
    await deal.save();

    const updatedDeal = await Deal.findById(dealId)
      .populate('influencer')
      .populate('prArticles.article');

    res.json({ message: 'Dispatch reverted and stock restored.', deal: updatedDeal, article });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Video Deliverable Status or Schedule Shoot/Live Date
export const updateVideoDeliverable = async (req, res) => {
  try {
    const { dealId, videoId } = req.params;
    const { status, scheduledDate, shootDate, liveUrl, notes } = req.body;

    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    const video = deal.videos.id(videoId);
    if (!video) return res.status(404).json({ error: 'Video item not found' });

    if (status) video.status = status;
    if (scheduledDate !== undefined) video.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    if (shootDate !== undefined) video.shootDate = shootDate ? new Date(shootDate) : null;
    if (liveUrl !== undefined) video.liveUrl = liveUrl;
    if (notes !== undefined) video.notes = notes;

    if (status === 'Video Live') {
      video.deliveredDate = new Date();
    }

    await deal.save();

    const updatedDeal = await Deal.findById(dealId)
      .populate('influencer')
      .populate('prArticles.article');

    res.json({ message: 'Deliverable status updated', deal: updatedDeal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Payment Status, Attach Slip Image, Record Transaction ID
export const updatePayment = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { advancePaid, paymentMethod, transactionId, slipImage, status, paymentDate, notes } = req.body;

    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    if (advancePaid !== undefined) {
      deal.payment.advancePaid = Number(advancePaid);
      deal.payment.remainingAmount = Math.max(0, deal.agreedRate - Number(advancePaid));
    }

    if (status) {
      deal.payment.status = status;
    } else {
      if (deal.payment.remainingAmount === 0 && deal.agreedRate > 0) {
        deal.payment.status = 'Fully Paid';
      } else if (deal.payment.advancePaid > 0) {
        deal.payment.status = 'Advance Paid';
      } else {
        deal.payment.status = 'Unpaid';
      }
    }

    if (paymentMethod) deal.payment.paymentMethod = paymentMethod;
    if (transactionId !== undefined) deal.payment.transactionId = transactionId;
    if (slipImage !== undefined) deal.payment.slipImage = slipImage;
    if (paymentDate) deal.payment.paymentDate = paymentDate;
    if (notes !== undefined) deal.payment.notes = notes;

    deal.payment.paidAt = new Date();

    await deal.save();

    const updatedDeal = await Deal.findById(dealId)
      .populate('influencer')
      .populate('prArticles.article');

    res.json({ message: 'Payment updated & slip recorded successfully', deal: updatedDeal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete deal
export const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    // Restore stock if any articles were dispatched in this deal
    for (const prItem of deal.prArticles) {
      if (prItem.dispatchStatus === 'Dispatched' || prItem.dispatchStatus === 'Delivered') {
        const article = await Article.findById(prItem.article);
        if (article) {
          article.sentPieces = Math.max(0, article.sentPieces - prItem.quantity);
          article.remainingPieces = Math.max(0, article.totalPRQuota - article.sentPieces);
          await article.save();
        }
      }
    }

    await Deal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deal deleted and inventory restored' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Overview dashboard metrics
export const getDashboardStats = async (req, res) => {
  try {
    const totalInfluencers = await Influencer.countDocuments();
    const totalDeals = await Deal.countDocuments();

    // PR Stock totals
    const articles = await Article.find();
    let totalPRQuota = 0;
    let totalSentPieces = 0;
    let totalRemainingPieces = 0;

    articles.forEach((a) => {
      totalPRQuota += a.totalPRQuota || 0;
      totalSentPieces += a.sentPieces || 0;
      totalRemainingPieces += a.remainingPieces || 0;
    });

    // Deals financials & deliverables
    const deals = await Deal.find();
    let totalAgreedSpend = 0;
    let totalPaidSpend = 0;
    let totalPendingSpend = 0;
    let liveVideosCount = 0;
    let pendingVideosCount = 0;
    let paidDealsCount = 0;
    let barterDealsCount = 0;

    deals.forEach((d) => {
      if (d.dealType === 'Barter PR') {
        barterDealsCount++;
      } else {
        paidDealsCount++;
      }

      totalAgreedSpend += d.agreedRate || 0;
      totalPaidSpend += d.payment?.advancePaid || 0;
      totalPendingSpend += d.payment?.remainingAmount || 0;

      d.videos.forEach((v) => {
        if (v.status === 'Video Live') {
          liveVideosCount++;
        } else {
          pendingVideosCount++;
        }
      });
    });

    res.json({
      influencers: totalInfluencers,
      deals: totalDeals,
      paidDealsCount,
      barterDealsCount,
      inventory: {
        totalQuota: totalPRQuota,
        sent: totalSentPieces,
        remaining: totalRemainingPieces,
      },
      finance: {
        agreed: totalAgreedSpend,
        paid: totalPaidSpend,
        pending: totalPendingSpend,
      },
      videos: {
        live: liveVideosCount,
        pending: pendingVideosCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
