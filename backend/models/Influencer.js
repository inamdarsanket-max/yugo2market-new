const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['instagram', 'youtube', 'tiktok', 'twitter', 'facebook', 'linkedin'],
    required: true
  },
  handle: {
    type: String,
    required: true
  },
  followers: {
    type: Number,
    default: 0
  },
  engagementRate: {
    type: Number,
    default: 0
  },
  avgLikes: {
    type: Number,
    default: 0
  },
  avgComments: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  }
});

const pricingSchema = new mongoose.Schema({
  postType: {
    type: String,
    enum: ['post', 'story', 'reel', 'video', 'live', 'collaboration'],
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

const influencerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  categories: [{
    type: String,
    enum: ['fashion', 'beauty', 'tech', 'food', 'travel', 'fitness', 'gaming', 'lifestyle', 'business', 'education', 'entertainment', 'sports', 'health', 'finance', 'other']
  }],
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' }
  },
  languages: [{
    type: String
  }],
  socialMedia: [socialMediaSchema],
  pricing: [pricingSchema],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalCampaigns: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  portfolio: [{
    title: String,
    description: String,
    imageUrl: String,
    link: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Influencer', influencerSchema);
