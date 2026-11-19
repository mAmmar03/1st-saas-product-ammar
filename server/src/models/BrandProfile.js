import mongoose from 'mongoose';

const brandProfileSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      default: 'Stylish Collection',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Luxury Pret & Festive Collection',
      trim: true,
    },
    brandLogo: {
      type: String,
      default: '', // base64 string or image URL
    },
    phone: {
      type: String,
      default: '0300 0000000',
    },
    email: {
      type: String,
      default: 'info@stylishcollection.com',
    },
    city: {
      type: String,
      default: 'Lahore, Pakistan',
    },
    address: {
      type: String,
      default: '',
    },
    instagramHandle: {
      type: String,
      default: '@stylishcollection',
    },
    authorizedSignatory: {
      type: String,
      default: 'Ammar / PR Manager',
    },
    adminPermissions: {
      canDeleteDeals: { type: Boolean, default: false },
      canDeleteInfluencers: { type: Boolean, default: false },
      canDeleteArticles: { type: Boolean, default: false },
      canEditBrandProfile: { type: Boolean, default: false },
      canImportBackup: { type: Boolean, default: false },
      canExportBackup: { type: Boolean, default: true },
      canEditFinancials: { type: Boolean, default: true },
      canDispatchPR: { type: Boolean, default: true },
      canScheduleReel: { type: Boolean, default: true },
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('BrandProfile', brandProfileSchema);
