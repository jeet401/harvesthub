const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['farmer', 'buyer'], required: true },
      lastSeen: { type: Date, default: Date.now }
    }],
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Optional: conversation about specific product
    lastMessage: {
      text: String,
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now }
    },
    isActive: { type: Boolean, default: true },
    negotiatedPrice: { type: Number }, // For price negotiations
    dealStatus: { 
      type: String, 
      enum: ['pending', 'negotiating', 'agreed', 'completed', 'cancelled'], 
      default: 'pending' 
    }
  },
  { timestamps: true }
);

// Indexes for efficient queries
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ productId: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });

module.exports = mongoose.model('Conversation', conversationSchema);