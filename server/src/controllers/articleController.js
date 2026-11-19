import Article from '../models/Article.js';
import Deal from '../models/Deal.js';

// Get all articles sorted in ascending order (1, 2, 3, 4 - newly added at bottom)
export const getArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: 1 });

    // For each article, aggregate recipients from deals
    const articlesWithBreakdown = await Promise.all(
      articles.map(async (art) => {
        const deals = await Deal.find({ 'prArticles.article': art._id })
          .populate('influencer', 'name instagramHandle phone city shippingAddress preferredSize')
          .select('campaignName prArticles influencer agreedDate spNumber');

        const dispatchedTo = [];
        const pendingFor = [];

        deals.forEach((deal) => {
          deal.prArticles.forEach((prItem) => {
            if (prItem.article.toString() === art._id.toString()) {
              const info = {
                influencerId: deal.influencer?._id,
                influencerName: deal.influencer?.name || 'Unknown',
                instagramHandle: deal.influencer?.instagramHandle || '',
                shippingAddress: deal.influencer?.shippingAddress || '',
                campaignName: deal.campaignName,
                spNumber: deal.spNumber,
                size: prItem.size || deal.influencer?.preferredSize || 'Medium',
                quantity: prItem.quantity,
                dispatchStatus: prItem.dispatchStatus,
                dispatchDate: prItem.dispatchDate,
                courierName: prItem.courierName,
                trackingNumber: prItem.trackingNumber || deal.spNumber,
              };

              if (prItem.dispatchStatus === 'Dispatched' || prItem.dispatchStatus === 'Delivered') {
                dispatchedTo.push(info);
              } else {
                pendingFor.push(info);
              }
            }
          });
        });

        return {
          ...art.toObject(),
          dispatchedTo, // Kis ko gaye hain
          pendingFor,   // Kis ko jaane hain
        };
      })
    );

    res.json(articlesWithBreakdown);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new article
export const createArticle = async (req, res) => {
  try {
    const { name, articleCode, totalPRQuota, category, unitCost, notes } = req.body;
    const existing = await Article.findOne({ articleCode: articleCode.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'Article with this code already exists' });
    }

    const article = new Article({
      name,
      articleCode: articleCode.toUpperCase(),
      category: category || 'General',
      totalPRQuota: Number(totalPRQuota),
      sentPieces: 0,
      remainingPieces: Number(totalPRQuota),
      unitCost: Number(unitCost) || 0,
      notes: notes || '',
    });

    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update article quota or details
export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    if (req.body.totalPRQuota !== undefined) {
      if (Number(req.body.totalPRQuota) < article.sentPieces) {
        return res.status(400).json({
          error: `Cannot reduce total quota below already sent pieces (${article.sentPieces})`,
        });
      }
      article.totalPRQuota = Number(req.body.totalPRQuota);
    }

    if (req.body.name) article.name = req.body.name;
    if (req.body.category) article.category = req.body.category;
    if (req.body.unitCost !== undefined) article.unitCost = Number(req.body.unitCost);
    if (req.body.notes !== undefined) article.notes = req.body.notes;

    article.remainingPieces = Math.max(0, article.totalPRQuota - article.sentPieces);
    await article.save();

    res.json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete article
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
