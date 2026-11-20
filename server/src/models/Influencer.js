import mongoose from 'mongoose';

const influencerSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true,
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Influencer name is required'],
      trim: true,
    },
    profileImage: {
      type: String,
      default: '', // base64 or URL
    },
    primaryPlatform: {
      type: String,
      default: 'Instagram',
      enum: ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Snapchat', 'Other'],
    },
    instagramHandle: {
      type: String,
      required: [true, 'Primary Handle / ID is required'],
      trim: true,
    },
    otherAccounts: {
      tiktok: { type: String, default: '' },
      youtube: { type: String, default: '' },
      facebook: { type: String, default: '' },
      snapchat: { type: String, default: '' },
    },
    preferredSize: {
      type: String,
      enum: ['Small', 'Medium', 'Large', 'XL', 'Free Size', 'Custom'],
      default: 'Medium',
    },
    followers: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    shippingAddress: {
      type: String,
      default: '',
      trim: true,
    },
    niche: {
      type: String,
      default: 'Fashion & Lifestyle',
      trim: true,
    },
    tier: {
      type: String,
      default: 'Micro',
    },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountTitle: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      iban: { type: String, default: '' },
    },
    rating: {
      type: Number,
      default: 5,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Influencer', influencerSchema);
