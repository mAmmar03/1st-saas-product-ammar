import Article from '../models/Article.js';
import Deal from '../models/Deal.js';

// Get all articles sorted in ascending order (Scoped to current workspace)
export const getArticles = async (req, res) => {
  try {
    const articles = await Article.find({ workspaceId: req.user.workspaceId }).sort({ createdAt: 1 });

    // For each article, aggregate recipients from deals in this workspace
    const articlesWithBreakdown = await Promise.all(
      articles.map(async (art) => {
        const deals = await Deal.find({
          workspaceId: req.user.workspaceId,
          'prArticles.article': art._id,
        })
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

// Create new article (Scoped to current workspace)
export const createArticle = async (req, res) => {
  try {
    const { name, articleCode, totalPRQuota, category, unitCost, notes } = req.body;
    const cleanCode = articleCode.toUpperCase().trim();

    const existing = await Article.findOne({
      workspaceId: req.user.workspaceId,
      articleCode: cleanCode,
    });

    if (existing) {
      return res.status(400).json({ error: `Article with code "${cleanCode}" already exists in your workspace` });
    }

    const article = new Article({
      workspaceId: req.user.workspaceId,
      name,
      articleCode: cleanCode,
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

// Update article quota or details (Scoped to current workspace)
export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      workspaceId: req.user.workspaceId,
    });
    if (!article) return res.status(404).json({ error: 'Article not found in your workspace' });

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

// Delete article (Scoped to current workspace)
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findOneAndDelete({
      _id: req.params.id,
      workspaceId: req.user.workspaceId,
    });
    if (!article) return res.status(404).json({ error: 'Article not found in your workspace' });
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
