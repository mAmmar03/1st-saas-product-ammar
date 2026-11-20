import BrandProfile from '../models/BrandProfile.js';

// Get active Brand / Company Profile (Scoped to workspace)
export const getBrandProfile = async (req, res) => {
  try {
    const wsId = req.user?.workspaceId;
    let profile = await BrandProfile.findOne({ workspaceId: wsId });
    if (!profile) {
      profile = await BrandProfile.create({
        workspaceId: wsId,
        brandName: 'Stylish Collection',
        tagline: 'Luxury Pret & Festive Collection',
        phone: '0300 0000000',
        city: 'Lahore, Pakistan',
        instagramHandle: '@stylishcollection',
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
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
