const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    images: [{ type: String }],
    status: { type: String, enum: ['pending', 'active', 'rejected'], default: 'pending' },
    // AGMARK Certification
    agmarkCertified: { type: Boolean, default: false },
    agmarkGrade: { type: String, enum: ['A+', 'A', 'B', 'C', 'Not Graded'], default: 'Not Graded' },
    agmarkCertificateUrl: { type: String }, // URL to certificate document
    agmarkCertificateNumber: { type: String }, // Certificate number
    agmarkVerificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    agmarkVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who verified
    agmarkVerifiedAt: { type: Date },
    agmarkRejectionReason: { type: String },
    // Additional product details
    unit: { type: String, default: 'kg' },
    location: { type: String },
    harvestDate: { type: Date },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

// Add index for common queries
productSchema.index({ sellerId: 1, status: 1 });
productSchema.index({ status: 1 });
productSchema.index({ agmarkVerificationStatus: 1 });
productSchema.index({ agmarkCertified: 1 });

module.exports = mongoose.model('Product', productSchema);


