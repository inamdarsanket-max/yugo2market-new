const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const { auth } = require('../middleware/auth');

// Cashfree Configuration
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'sandbox';
const CASHFREE_BASE_URL = CASHFREE_ENV === 'production' 
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

// @route   POST /api/payments/create-order
// @desc    Create a new payment order
// @access  Private
router.post('/create-order', auth, [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['campaign_deposit', 'milestone_payment', 'wallet_recharge']).withMessage('Invalid payment type'),
  body('campaignId').optional()
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

    const { amount, type, campaignId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate unique order ID
    const orderId = `order_${uuidv4().replace(/-/g, '').substring(0, 20)}`;

    // Create payment record
    const payment = new Payment({
      orderId,
      user: req.user.id,
      campaign: campaignId || null,
      amount: parseFloat(amount),
      type,
      status: 'pending',
      currency: 'INR'
    });

    await payment.save();

    // Create Cashfree order
    const cashfreePayload = {
      order_id: orderId,
      order_amount: parseFloat(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: user._id.toString(),
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: user.phone || '9999999999'
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/dashboard/payments?order_id=${orderId}`,
        notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`
      }
    };

    // Check if Cashfree credentials are configured
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      // For development without Cashfree credentials, return mock response
      console.log('⚠️ Cashfree credentials not configured. Using mock payment.');
      
      // Update payment with mock session
      payment.paymentSessionId = `mock_session_${orderId}`;
      await payment.save();

      return res.json({
        success: true,
        message: 'Payment order created (Mock Mode)',
        paymentSessionId: payment.paymentSessionId,
        orderId,
        amount: parseFloat(amount),
        currency: 'INR',
        mockMode: true
      });
    }

    // Create order with Cashfree
    const cashfreeResponse = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      cashfreePayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'x-api-version': '2022-09-01'
        }
      }
    );

    // Update payment with Cashfree order ID
    payment.cfOrderId = cashfreeResponse.data.cf_order_id;
    payment.paymentSessionId = cashfreeResponse.data.payment_session_id;
    await payment.save();

    res.json({
      success: true,
      message: 'Payment order created successfully',
      paymentSessionId: cashfreeResponse.data.payment_session_id,
      orderId,
      amount: parseFloat(amount),
      currency: 'INR'
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating payment order',
      error: error.message
    });
  }
});

// @route   GET /api/payments/my-payments
// @desc    Get user's payment history
// @access  Private
router.get('/my-payments', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      Payment.find({ user: req.user.id })
        .populate('campaign', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Payment.countDocuments({ user: req.user.id })
    ]);

    res.json({
      success: true,
      payments,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Get Payments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments'
    });
  }
});

// @route   GET /api/payments/:id
// @desc    Get payment details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      $or: [
        { _id: req.params.id },
        { orderId: req.params.id }
      ],
      user: req.user.id
    }).populate('campaign', 'title');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Get Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment'
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment status
// @access  Private
router.post('/verify', auth, [
  body('orderId').notEmpty().withMessage('Order ID is required')
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

    const { orderId } = req.body;

    const payment = await Payment.findOne({ orderId, user: req.user.id });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // If Cashfree not configured, simulate success for mock payments
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      if (payment.paymentSessionId && payment.paymentSessionId.startsWith('mock_session_')) {
        // Simulate successful payment
        payment.status = 'success';
        payment.updatedAt = Date.now();
        await payment.save();

        // Update wallet for wallet_recharge
        if (payment.type === 'wallet_recharge') {
          await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'wallet.balance': payment.amount }
          });
        }

        return res.json({
          success: true,
          message: 'Payment verified (Mock Mode)',
          payment,
          mockMode: true
        });
      }
    }

    // Verify with Cashfree
    try {
      const cashfreeResponse = await axios.get(
        `${CASHFREE_BASE_URL}/orders/${orderId}`,
        {
          headers: {
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
            'x-api-version': '2022-09-01'
          }
        }
      );

      const orderStatus = cashfreeResponse.data.order_status;

      // Update payment status based on Cashfree response
      if (orderStatus === 'PAID') {
        payment.status = 'success';
        payment.updatedAt = Date.now();
        await payment.save();

        // Update wallet for wallet_recharge
        if (payment.type === 'wallet_recharge') {
          await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'wallet.balance': payment.amount }
          });
        }
      } else if (orderStatus === 'FAILED') {
        payment.status = 'failed';
        payment.updatedAt = Date.now();
        await payment.save();
      }

      res.json({
        success: true,
        payment,
        cashfreeStatus: orderStatus
      });
    } catch (cfError) {
      console.error('Cashfree Verification Error:', cfError.message);
      res.json({
        success: true,
        payment,
        warning: 'Could not verify with Cashfree, using local status'
      });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying payment'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Cashfree webhook
// @access  Public
router.post('/webhook', async (req, res) => {
  try {
    const { orderId, orderStatus, referenceId, paymentDetails } = req.body;

    console.log('🔔 Webhook received:', { orderId, orderStatus });

    // Find payment by order ID
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      console.error('Webhook: Payment not found for orderId:', orderId);
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Update payment status
    if (orderStatus === 'PAID') {
      payment.status = 'success';
      payment.cfOrderId = referenceId;
      payment.metadata = { ...payment.metadata, paymentDetails };
      await payment.save();

      // Update wallet for wallet_recharge
      if (payment.type === 'wallet_recharge') {
        await User.findByIdAndUpdate(payment.user, {
          $inc: { 'wallet.balance': payment.amount }
        });
      }

      // Update campaign payment status if applicable
      if (payment.campaign) {
        await Campaign.findByIdAndUpdate(payment.campaign, {
          $set: { status: 'active', updatedAt: Date.now() }
        });
      }

      console.log('✅ Payment marked as success:', orderId);
    } else if (orderStatus === 'FAILED') {
      payment.status = 'failed';
      await payment.save();
      console.log('❌ Payment marked as failed:', orderId);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing error' });
  }
});

// @route   POST /api/payments/refund/:id
// @desc    Process refund for a payment
// @access  Private (Admin only)
router.post('/refund/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund successful payments'
      });
    }

    // Create refund record
    const refundOrderId = `refund_${uuidv4().replace(/-/g, '').substring(0, 20)}`;
    
    const refundPayment = new Payment({
      orderId: refundOrderId,
      user: payment.user,
      campaign: payment.campaign,
      amount: payment.amount,
      type: 'refund',
      status: 'success',
      currency: 'INR',
      metadata: { originalPayment: payment._id }
    });

    await refundPayment.save();

    // Update original payment
    payment.status = 'refunded';
    payment.updatedAt = Date.now();
    await payment.save();

    // Deduct from wallet if it was a wallet recharge
    if (payment.type === 'wallet_recharge') {
      await User.findByIdAndUpdate(payment.user, {
        $inc: { 'wallet.balance': -payment.amount }
      });
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: refundPayment
    });
  } catch (error) {
    console.error('Refund Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing refund'
    });
  }
});

// @route   GET /api/payments/admin/all
// @desc    Get all payments (Admin only)
// @access  Private (Admin)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { page = 1, limit = 20, status = 'all' } = req.query;

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [payments, total, totalRevenue] = await Promise.all([
      Payment.find(query)
        .populate('user', 'name email')
        .populate('campaign', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Payment.countDocuments(query),
      Payment.aggregate([
        { $match: { status: 'success', type: { $ne: 'refund' } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      success: true,
      payments,
      total,
      totalRevenue: totalRevenue[0]?.total || 0,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Get All Payments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments'
    });
  }
});

module.exports = router;
