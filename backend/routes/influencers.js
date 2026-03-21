const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Influencer = require('../models/Influencer');
const User = require('../models/User');
const { auth, influencerOnly } = require('../middleware/auth');

// @route   GET /api/influencers
// @desc    Get all influencers with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = 'rating',
      minFollowers,
      maxPrice,
      location
    } = req.query;

    const query = {};

    // Category filter
    if (category && category !== 'all') {
      query.categories = { $in: [category.toLowerCase()] };
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      query.$or = [
        { user: { $in: userIds } },
        { bio: searchRegex },
        { 'location.city': searchRegex }
      ];
    }

    // Followers filter
    if (minFollowers) {
      query['socialMedia.followers'] = { $gte: parseInt(minFollowers) };
    }

    // Price filter
    if (maxPrice) {
      query['pricing.price'] = { $lte: parseInt(maxPrice) };
    }

    // Location filter
    if (location) {
      query['location.city'] = new RegExp(location, 'i');
    }

    // Sort options
    let sortOption = {};
    switch (sortBy) {
      case 'rating':
        sortOption = { rating: -1, totalReviews: -1 };
        break;
      case 'followers':
        sortOption = { 'socialMedia.followers': -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'price_low':
        sortOption = { 'pricing.price': 1 };
        break;
      case 'price_high':
        sortOption = { 'pricing.price': -1 };
        break;
      default:
        sortOption = { rating: -1 };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [influencers, total] = await Promise.all([
      Influencer.find(query)
        .populate('user', 'name email avatar phone isActive')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Influencer.countDocuments(query)
    ]);

    // Filter out influencers whose users are inactive
    const activeInfluencers = influencers.filter(inf => inf.user && inf.user.isActive);

    res.json({
      success: true,
      influencers: activeInfluencers,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Get Influencers Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching influencers'
    });
  }
});

// @route   GET /api/influencers/:id
// @desc    Get single influencer by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.params.id)
      .populate('user', 'name email avatar phone company isActive');

    if (!influencer) {
      return res.status(404).json({
        success: false,
        message: 'Influencer not found'
      });
    }

    if (!influencer.user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Influencer not found'
      });
    }

    res.json({
      success: true,
      influencer
    });
  } catch (error) {
    console.error('Get Influencer Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching influencer'
    });
  }
});

// @route   GET /api/influencers/me/profile
// @desc    Get current influencer's profile
// @access  Private (Influencer only)
router.get('/me/profile', auth, influencerOnly, async (req, res) => {
  try {
    const influencer = await Influencer.findOne({ user: req.user.id })
      .populate('user', 'name email avatar phone company');

    if (!influencer) {
      return res.status(404).json({
        success: false,
        message: 'Influencer profile not found'
      });
    }

    res.json({
      success: true,
      influencer
    });
  } catch (error) {
    console.error('Get My Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/influencers/me/profile
// @desc    Update influencer profile
// @access  Private (Influencer only)
router.put('/me/profile', auth, influencerOnly, [
  body('bio').optional().trim(),
  body('categories').optional().isArray(),
  body('languages').optional().isArray(),
  body('location').optional().isObject(),
  body('socialMedia').optional().isArray(),
  body('pricing').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      bio,
      categories,
      languages,
      location,
      socialMedia,
      pricing,
      portfolio,
      isAvailable
    } = req.body;

    const updateData = { updatedAt: Date.now() };

    if (bio !== undefined) updateData.bio = bio;
    if (categories) updateData.categories = categories;
    if (languages) updateData.languages = languages;
    if (location) updateData.location = location;
    if (socialMedia) updateData.socialMedia = socialMedia;
    if (pricing) updateData.pricing = pricing;
    if (portfolio) updateData.portfolio = portfolio;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    const influencer = await Influencer.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true }
    ).populate('user', 'name email avatar phone company');

    if (!influencer) {
      return res.status(404).json({
        success: false,
        message: 'Influencer profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      influencer
    });
  } catch (error) {
    console.error('Update Influencer Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @route   PUT /api/influencers/:id/featured
// @desc    Toggle featured status (Admin only)
// @access  Private (Admin)
router.put('/:id/featured', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { isFeatured } = req.body;

    const influencer = await Influencer.findByIdAndUpdate(
      req.params.id,
      { $set: { isFeatured, updatedAt: Date.now() } },
      { new: true }
    );

    if (!influencer) {
      return res.status(404).json({
        success: false,
        message: 'Influencer not found'
      });
    }

    res.json({
      success: true,
      message: `Influencer ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      influencer
    });
  } catch (error) {
    console.error('Toggle Featured Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
