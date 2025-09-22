const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['buyer', 'farmer', 'admin'], 
      default: 'buyer' 
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Add index for role-based queries
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
