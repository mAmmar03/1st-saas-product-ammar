import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Article name is required'],
      trim: true,
    },
    articleCode: {
      type: String,
      required: [true, 'Article code/SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    totalPRQuota: {
      type: Number,
      required: [true, 'Total PR quota is required'],
      min: [0, 'Quota cannot be negative'],
    },
    sentPieces: {
      type: Number,
      default: 0,
      min: [0, 'Sent pieces cannot be negative'],
    },
    remainingPieces: {
      type: Number,
      default: function () {
        return this.totalPRQuota - this.sentPieces;
      },
    },
    unitCost: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Auto compute remaining pieces before saving
articleSchema.pre('save', function (next) {
  this.remainingPieces = Math.max(0, this.totalPRQuota - this.sentPieces);
  next();
});

export default mongoose.model('Article', articleSchema);
