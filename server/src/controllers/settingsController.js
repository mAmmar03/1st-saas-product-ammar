import BrandProfile from '../models/BrandProfile.js';

// Get active Brand / Company Profile
export const getBrandProfile = async (req, res) => {
  try {
    let profile = await BrandProfile.findOne();
    if (!profile) {
      profile = await BrandProfile.create({
        brandName: 'Stylish Collection',
        tagline: 'Luxury Pret & Festive Collection',
        phone: '0300 0000000',
        city: 'Lahore, Pakistan',
        instagramHandle: '@stylishcollection',
        authorizedSignatory: 'Ammar / PR Manager',
      });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Brand / Company Profile
export const updateBrandProfile = async (req, res) => {
  try {
    let profile = await BrandProfile.findOne();
    if (!profile) {
      profile = new BrandProfile(req.body);
    } else {
      Object.assign(profile, req.body);
    }
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
