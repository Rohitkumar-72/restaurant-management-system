const mongoose = require('mongoose');

const slugify = (value) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    image: { type: String, trim: true, maxlength: 2000, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0, min: 0, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

categorySchema.pre('validate', function setSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);