const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    refundId: { type: String, trim: true, default: '' },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['PENDING', 'PROCESSED', 'FAILED', 'CANCELLED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
    razorpayOrderId: { type: String, trim: true, default: '' },
    razorpayPaymentId: { type: String, trim: true, default: '' },
    currency: { type: String, enum: ['INR'], default: 'INR' },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'], default: 'PENDING' },
    method: { type: String, trim: true, default: '' },
    paidAt: { type: Date, default: null },
    failureReason: { type: String, trim: true, maxlength: 500, default: '' },
    refunds: { type: [refundSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);