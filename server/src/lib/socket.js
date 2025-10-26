const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const connectedUsers = new Map(); // userId -> socketId mapping

module.exports = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const { userId, role } = socket.handshake.auth;
      
      if (!userId || !role) {
        return next(new Error('User ID and role required'));
      }

      // For now, trust the client-provided data
      // In production, you'd want to validate against a session store
      socket.userId = userId;
      socket.userRole = role;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔗 User ${socket.userId} (${socket.userRole}) connected`);
    
    // Store connected user
    connectedUsers.set(socket.userId, socket.id);

    // Join user to their personal room for direct messaging
    socket.join(`user:${socket.userId}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Check if user is participant in conversation
        const isParticipant = conversation.participants.some(
          p => p.userId.toString() === socket.userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        console.log(`📝 User ${socket.userId} joined conversation ${conversationId}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, text, messageType = 'text', priceOffer } = data;

        // Validate conversation and user participation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const isParticipant = conversation.participants.some(
          p => p.userId.toString() === socket.userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to send message' });
          return;
        }

        // Create new message
        const message = new Message({
          conversationId,
          senderId: socket.userId,
          text,
          messageType,
          priceOffer: messageType.includes('price') ? priceOffer : undefined
        });

        await message.save();
        await message.populate('senderId', 'email role');

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            text,
            senderId: socket.userId,
            timestamp: new Date()
          }
        });

        // Emit message to all conversation participants
        io.to(`conversation:${conversationId}`).emit('new_message', {
          _id: message._id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          text: message.text,
          messageType: message.messageType,
          priceOffer: message.priceOffer,
          createdAt: message.createdAt
        });

        console.log(`💬 Message sent in conversation ${conversationId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle price negotiation
    socket.on('negotiate_price', async (data) => {
      try {
        const { conversationId, newPrice, action } = data; // action: 'offer', 'counter', 'accept', 'reject'

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        let messageType = 'price_offer';
        let messageText = `Price ${action}: ₹${newPrice}`;

        if (action === 'accept') {
          messageType = 'deal_accepted';
          messageText = `Deal accepted at ₹${newPrice}`;
          // Update conversation with negotiated price
          await Conversation.findByIdAndUpdate(conversationId, {
            negotiatedPrice: newPrice,
            dealStatus: 'agreed'
          });
        } else if (action === 'reject') {
          messageType = 'deal_rejected';
          messageText = `Price offer of ₹${newPrice} rejected`;
        }

        // Send price negotiation message
        const message = new Message({
          conversationId,
          senderId: socket.userId,
          text: messageText,
          messageType,
          priceOffer: newPrice
        });

        await message.save();
        await message.populate('senderId', 'email role');

        // Emit to conversation participants
        io.to(`conversation:${conversationId}`).emit('price_negotiation', {
          _id: message._id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          text: message.text,
          messageType: message.messageType,
          priceOffer: message.priceOffer,
          action,
          createdAt: message.createdAt
        });

        console.log(`💰 Price negotiation in conversation ${conversationId}: ${action} ₹${newPrice}`);
      } catch (error) {
        console.error('Price negotiation error:', error);
        socket.emit('error', { message: 'Failed to process price negotiation' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: false
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User ${socket.userId} disconnected`);
      connectedUsers.delete(socket.userId);
    });
  });

  return { connectedUsers };
};