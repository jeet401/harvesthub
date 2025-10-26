const express = require('express');
const mongoose = require('mongoose');
const { authRequired } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Product = require('../models/Product');

const router = express.Router();

// Get all conversations for current user
router.get('/conversations', authRequired, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const conversations = await Conversation.find({
      'participants.userId': userId,
      isActive: true
    })
    .populate('participants.userId', 'email role')
    .populate('productId', 'title price images')
    .populate('lastMessage.senderId', 'email role')
    .sort({ 'lastMessage.timestamp': -1 });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Start a new conversation
router.post('/conversations', authRequired, async (req, res) => {
  try {
    const { participantId, productId, initialMessage } = req.body;
    const currentUserId = req.user.sub;

    // Get user details
    const currentUser = await User.findById(currentUserId);
    const participant = await User.findById(participantId);

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    // Check if conversation already exists between these users for this product
    let conversation = await Conversation.findOne({
      $and: [
        { 'participants.userId': currentUserId },
        { 'participants.userId': participantId },
        { productId: productId || null }
      ]
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [
          { userId: currentUserId, role: currentUser.role },
          { userId: participantId, role: participant.role }
        ],
        productId: productId || undefined,
        lastMessage: {
          text: initialMessage || 'Started conversation',
          senderId: currentUserId,
          timestamp: new Date()
        }
      });

      await conversation.save();

      // Create initial message if provided
      if (initialMessage) {
        const message = new Message({
          conversationId: conversation._id,
          senderId: currentUserId,
          text: initialMessage
        });
        await message.save();
      }
    }

    // Populate and return conversation
    await conversation.populate('participants.userId', 'email role');
    await conversation.populate('productId', 'title price images');

    res.json({ conversation });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authRequired, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.sub;

    // Verify user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized to view this conversation' });
    }

    // Get messages with pagination (newest first)
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read by current user
    await Message.updateMany(
      { 
        conversationId, 
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId }
      },
      { 
        $push: { 
          readBy: { 
            userId, 
            readAt: new Date() 
          } 
        } 
      }
    );

    res.json({ messages: messages.reverse() }); // Return in chronological order
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get farmers list for buyers to start conversations
router.get('/farmers', authRequired, async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ error: 'Only buyers can view farmers list' });
    }

    const farmers = await User.find({ role: 'farmer', isActive: true })
      .select('email createdAt')
      .sort({ createdAt: -1 });

    res.json({ farmers });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({ error: 'Failed to fetch farmers' });
  }
});

// Get buyers list for farmers to start conversations
router.get('/buyers', authRequired, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ error: 'Only farmers can view buyers list' });
    }

    const buyers = await User.find({ role: 'buyer', isActive: true })
      .select('email createdAt')
      .sort({ createdAt: -1 });

    res.json({ buyers });
  } catch (error) {
    console.error('Get buyers error:', error);
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

// Update product price after successful negotiation (farmers only)
router.patch('/products/:productId/price', authRequired, async (req, res) => {
  try {
    const { productId } = req.params;
    const { newPrice, conversationId } = req.body;
    const userId = req.user.sub;

    if (req.user.role !== 'farmer') {
      return res.status(403).json({ error: 'Only farmers can update product prices' });
    }

    // Verify the conversation has an agreed deal
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.dealStatus !== 'agreed') {
      return res.status(400).json({ error: 'No agreed deal found for this conversation' });
    }

    // Update product price
    const product = await Product.findByIdAndUpdate(
      productId,
      { price: newPrice },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update conversation status
    await Conversation.findByIdAndUpdate(conversationId, {
      dealStatus: 'completed'
    });

    res.json({ 
      message: 'Product price updated successfully',
      product: {
        _id: product._id,
        title: product.title,
        price: product.price
      }
    });
  } catch (error) {
    console.error('Update product price error:', error);
    res.status(500).json({ error: 'Failed to update product price' });
  }
});

module.exports = router;