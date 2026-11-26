import mongoose from 'mongoose';

const brandProfileSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true,
      default: null,
    },
    brandName: {
      type: String,
      default: 'Brand Workspace',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Luxury Pret & Influencer PR Management',
      trim: true,
    },
    brandLogo: {
      type: String,
      default: '', // base64 string or image URL
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    instagramHandle: {
      type: String,
      default: '',
    },
    authorizedSignatory: {
      type: String,
      default: 'Super Admin',
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
