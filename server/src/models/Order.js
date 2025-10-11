const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 }, // quantity * price
  },
  { _id: false }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    
    // Pricing
    subtotal: { type: Number, required: true, min: 0 },
    shippingCharges: { type: Number, default: 0, min: 0 },
    taxes: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    
    // Order Status
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'], 
      default: 'pending' 
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    
    // Delivery Information
    deliveryAddress: deliveryAddressSchema,
    progress: { type: Number, default: 0, min: 0, max: 100 }, // Progress percentage
    trackingId: { type: String },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    
    // Razorpay Integration
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    
    // Additional Information
    notes: { type: String },
    cancelReason: { type: String },
    refundReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);


