const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Influencer = require('../models/Influencer');
const Campaign = require('../models/Campaign');
const Payment = require('../models/Payment');
const { auth, adminOnly } = require('../middleware/auth');

// Apply auth and admin middleware to all routes
router.use(auth, adminOnly);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get stats
    const [
      totalUsers,
      newUsersToday,
      totalInfluencers,
      totalCampaigns,
      campaignStats,
      paymentStats,
      recentUsers,
      recentCampaigns
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ role: 'influencer' }),
      Campaign.countDocuments(),
      Campaign.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Payment.aggregate([
        { $match: { status: 'success' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            revenueThisMonth: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', thirtyDaysAgo] },
                  '$amount',
                  0
                ]
              }
            }
          }
        }
      ]),
      User.find()
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
      Campaign.find()
        .populate('brand', 'name')
        .populate({
          path: 'influencer',
          populate: { path: 'user', select: 'name' }
        })
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Format campaign stats
    const campaignStatusMap = {};
    campaignStats.forEach(stat => {
      campaignStatusMap[stat._id] = stat.count;
    });

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          newToday: newUsersToday,
          influencers: totalInfluencers,
          brands: totalUsers - totalInfluencers
        },
        campaigns: {
          total: totalCampaigns,
          active: campaignStatusMap.active || 0,
          pending: campaignStatusMap.pending || 0,
          completed: campaignStatusMap.completed || 0,
          in_progress: campaignStatusMap.in_progress || 0,
          cancelled: campaignStatusMap.cancelled || 0,
          draft: campaignStatusMap.draft || 0
        },
        payments: {
          totalRevenue: paymentStats[0]?.totalRevenue || 0,
          revenueThisMonth: paymentStats[0]?.revenueThisMonth || 0
        }
      },
      recentActivity: {
        users: recentUsers,
        campaigns: recentCampaigns
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard stats'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role = 'all', search = '' } = req.query;

    const query = {};
    if (role !== 'all') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// @route   PATCH /api/admin/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private (Admin)
router.patch('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating own account
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    user.isActive = !user.isActive;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle User Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling user status'
    });
  }
});

// @route   PATCH /api/admin/users/:id/make-admin
// @desc    Make user an admin
// @access  Private (Admin)
router.patch('/users/:id/make-admin', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = 'admin';
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'User promoted to admin successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Make Admin Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error making user admin'
    });
  }
});

// @route   GET /api/admin/influencers
// @desc    Get all influencers for admin
// @access  Private (Admin)
router.get('/influencers', async (req, res) => {
  try {
    const { page = 1, limit = 20, category = 'all' } = req.query;

    const query = {};
    if (category !== 'all') {
      query.categories = { $in: [category.toLowerCase()] };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [influencers, total] = await Promise.all([
      Influencer.find(query)
        .populate('user', 'name email avatar phone isActive')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Influencer.countDocuments(query)
    ]);

    res.json({
      success: true,
      influencers,
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

// @route   GET /api/admin/campaigns
// @desc    Get all campaigns for admin
// @access  Private (Admin)
router.get('/campaigns', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [campaigns, total] = await Promise.all([
      Campaign.find(query)
        .populate('brand', 'name email avatar')
        .populate({
          path: 'influencer',
          populate: { path: 'user', select: 'name email avatar' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Campaign.countDocuments(query)
    ]);

    res.json({
      success: true,
      campaigns,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Get Campaigns Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching campaigns'
    });
  }
});

// @route   PATCH /api/admin/campaigns/:id/status
// @desc    Update campaign status (admin override)
// @access  Private (Admin)
router.patch('/campaigns/:id/status', [
  body('status').isIn(['draft', 'pending', 'active', 'in_progress', 'completed', 'cancelled', 'disputed'])
    .withMessage('Invalid status')
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

    const { status } = req.body;

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $set: { status, updatedAt: Date.now() } },
      { new: true }
    )
      .populate('brand', 'name email avatar')
      .populate({
        path: 'influencer',
        populate: { path: 'user', select: 'name email avatar' }
      });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      message: 'Campaign status updated successfully',
      campaign
    });
  } catch (error) {
    console.error('Update Campaign Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating campaign status'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin)
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      userGrowth,
      revenueGrowth,
      campaignStatus,
      topCategories
    ] = await Promise.all([
      // User growth by date
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Revenue growth by date
      Payment.aggregate([
        { 
          $match: { 
            status: 'success',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Campaign status distribution
      Campaign.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Top categories
      Influencer.aggregate([
        { $unwind: '$categories' },
        {
          $group: {
            _id: '$categories',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      userGrowth,
      revenueGrowth,
      campaignStatus,
      topCategories
    });
  } catch (error) {
    console.error('Get Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics'
    });
  }
});

module.exports = router;
