import mongoose from 'mongoose';

const prBudgetSchema = new mongoose.Schema(
  {
    periodType: {
      type: String,
      enum: ['monthly', 'weekly'],
      default: 'monthly',
    },
    // e.g. "2026-11" for November 2026 or "2026-W47" for Week 47
    periodKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    periodLabel: {
      type: String,
      default: '', // e.g. "November 2026" or "Week 47, Nov 2026"
      trim: true,
    },
    allocatedBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: String,
      default: 'Super Admin (Ammar)',
    },
  },
  { timestamps: true }
);

export default mongoose.model('PRBudget', prBudgetSchema);
