const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');
const Influencer = require('../models/Influencer');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/campaigns
// @desc    Get all campaigns for logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter by user role
    if (req.user.role === 'user') {
      query.brand = req.user.id;
    } else if (req.user.role === 'influencer') {
      const influencer = await Influencer.findOne({ user: req.user.id });
      if (influencer) {
        query.influencer = influencer._id;
      } else {
        return res.json({
          success: true,
          campaigns: [],
          total: 0,
          currentPage: 1,
          totalPages: 0
        });
      }
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [campaigns, total] = await Promise.all([
      Campaign.find(query)
        .populate('brand', 'name email avatar company')
        .populate({
          path: 'influencer',
          populate: {
            path: 'user',
            select: 'name email avatar'
          }
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

// @route   GET /api/campaigns/:id
// @desc    Get single campaign by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('brand', 'name email avatar company')
      .populate({
        path: 'influencer',
        populate: {
          path: 'user',
          select: 'name email avatar'
        }
      });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user has access to this campaign
    const influencer = await Influencer.findOne({ user: req.user.id });
    const isBrand = campaign.brand._id.toString() === req.user.id;
    const isInfluencer = influencer && campaign.influencer._id.toString() === influencer._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBrand && !isInfluencer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      campaign
    });
  } catch (error) {
    console.error('Get Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching campaign'
    });
  }
});

// @route   POST /api/campaigns
// @desc    Create a new campaign
// @access  Private (Brand only)
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('budget').isNumeric().withMessage('Budget must be a number'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('influencerId').notEmpty().withMessage('Influencer ID is required')
], async (req, res) => {
  try {
    // Only brands can create campaigns
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only brands can create campaigns'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      budget,
      startDate,
      endDate,
      influencerId,
      deliverables,
      milestones,
      notes
    } = req.body;

    // Verify influencer exists
    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      return res.status(404).json({
        success: false,
        message: 'Influencer not found'
      });
    }

    // Create campaign
    const campaign = new Campaign({
      title,
      description,
      brand: req.user.id,
      influencer: influencerId,
      budget: parseFloat(budget),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'pending',
      deliverables: deliverables || [],
      milestones: milestones || [],
      notes: notes || '',
      metrics: {
        reach: 0,
        impressions: 0,
        engagement: 0,
        clicks: 0,
        conversions: 0
      }
    });

    await campaign.save();

    // Populate and return
    const populatedCampaign = await Campaign.findById(campaign._id)
      .populate('brand', 'name email avatar company')
      .populate({
        path: 'influencer',
        populate: {
          path: 'user',
          select: 'name email avatar'
        }
      });

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaign: populatedCampaign
    });
  } catch (error) {
    console.error('Create Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating campaign'
    });
  }
});

// @route   PATCH /api/campaigns/:id/status
// @desc    Update campaign status
// @access  Private
router.patch('/:id/status', auth, [
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
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check permissions
    const influencer = await Influencer.findOne({ user: req.user.id });
    const isBrand = campaign.brand.toString() === req.user.id;
    const isInfluencer = influencer && campaign.influencer.toString() === influencer._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBrand && !isInfluencer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate status transitions
    const validTransitions = {
      pending: ['active', 'cancelled'],
      active: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'disputed'],
      draft: ['pending'],
      completed: [],
      cancelled: [],
      disputed: ['completed', 'cancelled']
    };

    if (!validTransitions[campaign.status].includes(status) && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${campaign.status} to ${status}`
      });
    }

    campaign.status = status;
    campaign.updatedAt = Date.now();
    await campaign.save();

    // Update influencer campaign count if completed
    if (status === 'completed') {
      await Influencer.findByIdAndUpdate(campaign.influencer, {
        $inc: { totalCampaigns: 1 }
      });
    }

    const populatedCampaign = await Campaign.findById(campaign._id)
      .populate('brand', 'name email avatar company')
      .populate({
        path: 'influencer',
        populate: {
          path: 'user',
          select: 'name email avatar'
        }
      });

    res.json({
      success: true,
      message: 'Campaign status updated successfully',
      campaign: populatedCampaign
    });
  } catch (error) {
    console.error('Update Campaign Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating campaign status'
    });
  }
});

// @route   PUT /api/campaigns/:id
// @desc    Update campaign details
// @access  Private (Brand only)
router.put('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Only brand who created or admin can update
    if (campaign.brand.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow updates for certain statuses
    if (!['draft', 'pending'].includes(campaign.status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update campaign in current status'
      });
    }

    const updateFields = ['title', 'description', 'budget', 'startDate', 'endDate', 'deliverables', 'milestones', 'notes'];
    const updateData = { updatedAt: Date.now() };

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    )
      .populate('brand', 'name email avatar company')
      .populate({
        path: 'influencer',
        populate: {
          path: 'user',
          select: 'name email avatar'
        }
      });

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      campaign: updatedCampaign
    });
  } catch (error) {
    console.error('Update Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating campaign'
    });
  }
});

// @route   DELETE /api/campaigns/:id
// @desc    Delete a campaign
// @access  Private (Brand only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Only brand who created or admin can delete
    if (campaign.brand.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow deletion for draft or pending campaigns
    if (!['draft', 'pending'].includes(campaign.status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete campaign in current status'
      });
    }

    await Campaign.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Delete Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting campaign'
    });
  }
});

module.exports = router;
