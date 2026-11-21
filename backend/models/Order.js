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
    specialInstructions: { type: String, trim: true, maxlength: 1000, default: '' },
    paymentStatus: { type: String, enum: ['not_required', 'pending', 'paid', 'failed', 'refunded'], default: 'not_required' },
    orderStatus: { type: String, enum: ['draft', 'demo', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'], default: 'draft' },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);