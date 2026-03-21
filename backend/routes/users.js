const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile with role-specific data
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let profileData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        company: user.company,
        isVerified: user.isVerified,
        isActive: user.isActive,
        wallet: user.wallet,
        createdAt: user.createdAt
      }
    };

    // If influencer, include influencer profile
    if (user.role === 'influencer') {
      const Influencer = require('../models/Influencer');
      const influencerProfile = await Influencer.findOne({ user: user._id });
      if (influencerProfile) {
        profileData.influencer = influencerProfile;
      }
    }

    res.json({
      success: true,
      ...profileData
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/wallet
// @desc    Get user wallet balance
// @access  Private
router.get('/wallet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wallet');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      wallet: user.wallet
    });
  } catch (error) {
    console.error('Get Wallet Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
