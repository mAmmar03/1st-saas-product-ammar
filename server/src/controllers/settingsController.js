import BrandProfile from '../models/BrandProfile.js';
import Workspace from '../models/Workspace.js';

// Get active Brand / Company Profile (Scoped to workspace)
export const getBrandProfile = async (req, res) => {
  try {
    const wsId = req.user?.workspaceId;
    let profile = await BrandProfile.findOne({ workspaceId: wsId });
    if (!profile) {
      const ws = await Workspace.findById(wsId);
      const defaultBrandName = ws?.name || (req.user?.name ? `${req.user.name}'s Brand` : 'Brand Workspace');
      profile = await BrandProfile.create({
        workspaceId: wsId,
        brandName: defaultBrandName,
        tagline: 'Luxury Pret & Influencer PR Management',
        phone: '',
        email: req.user?.email || '',
        city: 'Lahore, Pakistan',
        instagramHandle: '',
        authorizedSignatory: req.user?.name ? `${req.user.name} (Super Admin)` : 'PR Manager',
      });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Brand / Company Profile (Scoped to workspace)
export const updateBrandProfile = async (req, res) => {
  try {
    const wsId = req.user?.workspaceId;
    let profile = await BrandProfile.findOne({ workspaceId: wsId });
    if (!profile) {
      profile = new BrandProfile({ ...req.body, workspaceId: wsId });
    } else {
      Object.assign(profile, req.body);
      profile.workspaceId = wsId;
    }
    await profile.save();

    // Also sync Workspace name if brandName changed
    if (req.body.brandName && wsId) {
      await Workspace.findByIdAndUpdate(wsId, { name: req.body.brandName.trim() });
    }

    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
