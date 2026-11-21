const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: String, required: true, trim: true, maxlength: 20 },
    qrIdentifier: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 80 },
    capacity: { type: Number, min: 1, max: 200, default: 4 },
    isActive: { type: Boolean, default: true, index: true },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'ORDERING', 'RESERVED'],
      default: 'AVAILABLE',
      index: true,
    },
  },
  { timestamps: true },
);

tableSchema.index({ tableNumber: 1 }, { unique: true });

module.exports = mongoose.models.Table || mongoose.model('Table', tableSchema);
