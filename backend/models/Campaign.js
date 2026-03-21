const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'paid'],
    default: 'pending'
  },
  dueDate: Date,
  completedAt: Date
});

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  influencer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Influencer',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'in_progress', 'completed', 'cancelled', 'disputed'],
    default: 'draft'
  },
  budget: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  deliverables: [{
    type: {
      type: String,
      enum: ['post', 'story', 'reel', 'video', 'live', 'blog', 'review']
    },
    quantity: Number,
    requirements: String,
    status: {
      type: String,
      enum: ['pending', 'in_review', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  milestones: [milestoneSchema],
  contentLinks: [{
    platform: String,
    url: String,
    postedAt: Date
  }],
  metrics: {
    reach: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Campaign', campaignSchema);
