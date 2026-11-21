const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    foodId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Food' },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    image: { type: String, trim: true, maxlength: 2000, default: '' },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, integer: true },
    itemTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    trackingToken: { type: String, required: true, select: false, unique: true },
    idempotencyKey: { type: String, trim: true, maxlength: 100, unique: true, sparse: true, select: false },
    customer: {
      name: { type: String, required: true, trim: true, maxlength: 100 },
      mobile: { type: String, required: true, trim: true, maxlength: 20 },
    },
    items: { type: [orderItemSchema], required: true, validate: [(items) => items.length > 0, 'Order requires at least one item'] },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    orderType: { type: String, required: true, enum: ['dine-in', 'takeaway'] },
    tableNumber: { type: String, trim: true, maxlength: 20, default: null },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null, index: true },
    specialInstructions: { type: String, trim: true, maxlength: 1000, default: '' },
    paymentMethod: { type: String, enum: ['pay_at_counter', 'cash', 'not_required', 'razorpay'], default: 'pay_at_counter' },
    paymentStatus: { type: String, enum: ['not_required', 'PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'], default: 'PENDING' },
    razorpayOrderId: { type: String, trim: true, default: '' },
    razorpayPaymentId: { type: String, trim: true, default: '' },
    paidAt: { type: Date, default: null },
    orderStatus: { type: String, enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED', 'REJECTED'], default: 'PLACED' },
    estimatedMinutes: { type: Number, min: 5, max: 180, default: 25 },
    rejectionReason: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);