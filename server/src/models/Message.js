const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Conversation', 
      required: true 
    },
    senderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    text: { type: String, required: true },
    messageType: { 
      type: String, 
      enum: ['text', 'price_offer', 'price_counter', 'deal_accepted', 'deal_rejected'], 
      default: 'text' 
    },
    priceOffer: { type: Number }, // For price negotiation messages
    isRead: { type: Boolean, default: false },
    readBy: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      readAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1 });

module.exports = mongoose.model('Message', messageSchema);