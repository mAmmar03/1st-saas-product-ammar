import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    masterPinHash: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin'],
      default: 'admin',
    },
    permissions: {
      canAccessDashboard: { type: Boolean, default: true },
      canAccessInventory: { type: Boolean, default: true },
      canAccessDeals: { type: Boolean, default: true },
      canAccessSchedule: { type: Boolean, default: true },
      canAccessInfluencers: { type: Boolean, default: true },
      canAccessCompany: { type: Boolean, default: false },
      canAccessBudget: { type: Boolean, default: false },
      canDispatchPR: { type: Boolean, default: true },
      canSettlePayment: { type: Boolean, default: false },
      canDeleteRecords: { type: Boolean, default: false },
      canExportData: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    resetPasswordCode: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Method to verify password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Method to verify master PIN
userSchema.methods.compareMasterPin = async function (pin) {
  if (!this.masterPinHash) return false;
  return bcrypt.compare(pin, this.masterPinHash);
};

export default mongoose.model('User', userSchema);
