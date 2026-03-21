const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/messages/conversations
// @desc    Get all conversations for logged in user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'name email avatar')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name avatar'
        }
      })
      .populate('campaign', 'title status')
      .sort({ updatedAt: -1 });

    // Add unread count for current user
    const conversationsWithUnread = conversations.map(conv => {
      const convObj = conv.toObject();
      convObj.unreadForMe = conv.unreadCount?.get(req.user.id.toString()) || 0;
      return convObj;
    });

    res.json({
      success: true,
      conversations: conversationsWithUnread
    });
  } catch (error) {
    console.error('Get Conversations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching conversations'
    });
  }
});

// @route   POST /api/messages/conversations
// @desc    Create a new conversation
// @access  Private
router.post('/conversations', auth, [
  body('participantId').notEmpty().withMessage('Participant ID is required'),
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

    const { participantId, campaignId } = req.body;

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Check if conversation already exists between these users
    let query = {
      type: 'direct',
      participants: { $all: [req.user.id, participantId] }
    };

    if (campaignId) {
      query.campaign = campaignId;
    }

    let conversation = await Conversation.findOne(query);

    if (conversation) {
      // Return existing conversation
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email avatar')
        .populate('lastMessage');

      return res.json({
        success: true,
        conversation,
        exists: true
      });
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [req.user.id, participantId],
      type: 'direct',
      campaign: campaignId || null,
      isActive: true
    });

    await conversation.save();

    // Populate and return
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      conversation
    });
  } catch (error) {
    console.error('Create Conversation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating conversation'
    });
  }
});

// @route   GET /api/messages/conversations/:id
// @desc    Get conversation details
// @access  Private
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user.id
    })
      .populate('participants', 'name email avatar')
      .populate('campaign', 'title status');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Get Conversation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching conversation'
    });
  }
});

// @route   GET /api/messages/conversations/:id/messages
// @desc    Get messages in a conversation
// @access  Private
router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // Check if user is part of conversation
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [messages, total] = await Promise.all([
      Message.find({
        conversation: req.params.id,
        isDeleted: false
      })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Message.countDocuments({
        conversation: req.params.id,
        isDeleted: false
      })
    ]);

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user.id },
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: { readBy: { user: req.user.id, readAt: new Date() } }
      }
    );

    // Reset unread count for this user
    conversation.unreadCount.set(req.user.id.toString(), 0);
    await conversation.save();

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching messages'
    });
  }
});

// @route   POST /api/messages/conversations/:id/messages
// @desc    Send a message in a conversation
// @access  Private
router.post('/conversations/:id/messages', auth, [
  body('content').trim().notEmpty().withMessage('Message content is required')
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

    const { content, type = 'text', attachments } = req.body;

    // Check if user is part of conversation
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user.id,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Create message
    const message = new Message({
      conversation: req.params.id,
      sender: req.user.id,
      content,
      type,
      attachments: attachments || [],
      readBy: [{ user: req.user.id, readAt: new Date() }]
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();

    // Increment unread count for other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
        const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });

    await conversation.save();

    // Populate message
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar');

    // Emit to all participants via Socket.io
    const io = req.app.get('io');
    conversation.participants.forEach(participantId => {
      io.to(req.params.id).emit('new_message', {
        conversationId: req.params.id,
        message: populatedMessage
      });
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      sender: req.user.id
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    message.isDeleted = true;
    message.updatedAt = Date.now();
    await message.save();

    // Notify other participants
    const io = req.app.get('io');
    io.to(message.conversation.toString()).emit('message_deleted', {
      conversationId: message.conversation,
      messageId: message._id
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting message'
    });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get total unread message count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
      isActive: true
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      totalUnread += conv.unreadCount?.get(req.user.id.toString()) || 0;
    });

    res.json({
      success: true,
      unreadCount: totalUnread
    });
  } catch (error) {
    console.error('Get Unread Count Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching unread count'
    });
  }
});

module.exports = router;
