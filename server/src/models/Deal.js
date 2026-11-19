import mongoose from 'mongoose';

const prItemSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  size: {
    type: String,
    enum: ['Small', 'Medium', 'Large', 'XL', 'Free Size', 'Custom'],
    default: 'Medium',
  },
  dispatchStatus: {
    type: String,
    enum: ['Pending', 'Dispatched', 'Delivered'],
    default: 'Pending',
  },
  dispatchDate: {
    type: Date,
  },
  courierName: {
    type: String,
    default: 'Standard Courier',
  },
  trackingNumber: {
    type: String,
    default: '',
  },
  deliveryNotes: {
    type: String,
    default: '',
  },
});

const videoItemSchema = new mongoose.Schema({
  videoType: {
    type: String,
    enum: [
      'Reel Collaboration',
      'Story Unboxing',
      'Highlights',
      'Story Promotion',
      'Dedicated Feed Post',
      'TikTok Video',
      'YouTube Integration',
    ],
    default: 'Reel Collaboration',
  },
  scheduledDate: {
    type: Date, // Scheduled live / shoot date once parcel is received
  },
  shootDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Pending', 'Draft Received', 'Approved', 'Video Live'],
    default: 'Pending',
  },
  liveUrl: {
    type: String,
    default: '',
  },
  deliveredDate: {
    type: Date,
  },
  notes: {
    type: String,
    default: '',
  },
});

const dealSchema = new mongoose.Schema(
  {
    spNumber: {
      type: String,
      trim: true,
      default: '', // e.g. SP# 17778
    },
    influencer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Influencer',
      required: true,
    },
    campaignName: {
      type: String,
      default: 'General PR Collaboration',
      trim: true,
    },
    dealType: {
      type: String,
      enum: ['Paid Collab', 'Barter PR'],
      default: 'Paid Collab',
    },
    agreedDate: {
      type: Date,
      default: Date.now,
    },
    agreedRate: {
      type: Number,
      required: true,
      min: 0,
    },
    ratePerVideo: {
      type: Number,
      required: true,
      min: 0,
    },
    dealStatus: {
      type: String,
      enum: ['Negotiation', 'Agreed', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Agreed',
    },
    prArticles: [prItemSchema],
    videos: [videoItemSchema],
    payment: {
      totalAmount: {
        type: Number,
        default: 0,
      },
      advancePaid: {
        type: Number,
        default: 0,
      },
      remainingAmount: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: ['Unpaid', 'Advance Paid', 'Fully Paid'],
        default: 'Unpaid',
      },
      paymentMethod: {
        type: String,
        default: 'Bank Transfer',
      },
      transactionId: {
        type: String,
        default: '',
      },
      slipImage: {
        type: String, // Base64 or URL of payment receipt/slip
        default: '',
      },
      paidAt: {
        type: Date,
      },
      notes: {
        type: String,
        default: '',
      },
    },
    pastDealNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Auto compute payment remaining
dealSchema.pre('save', function (next) {
  if (this.dealType === 'Barter PR') {
    this.agreedRate = 0;
    this.ratePerVideo = 0;
    this.payment.totalAmount = 0;
    this.payment.advancePaid = 0;
    this.payment.remainingAmount = 0;
    this.payment.status = 'Barter (No Fee)';
  } else if (this.agreedRate !== undefined) {
    this.payment.totalAmount = this.agreedRate;
    this.payment.remainingAmount = Math.max(0, this.agreedRate - (this.payment.advancePaid || 0));
    if (this.payment.remainingAmount === 0 && this.agreedRate > 0) {
      this.payment.status = 'Fully Paid';
    } else if (this.payment.advancePaid > 0) {
      this.payment.status = 'Advance Paid';
    } else {
      this.payment.status = 'Unpaid';
    }
  }
  next();
});

export default mongoose.model('Deal', dealSchema);
