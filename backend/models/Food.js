const mongoose = require('mongoose');

const slugify = (value) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Food description is required'],
      trim: true,
      maxlength: 600,
    },
    category: {
      type: String,
      required: [true, 'Food category is required'],
      trim: true,
      maxlength: 80,
      index: true,
    },
    foodType: {
      type: String,
      enum: ['veg', 'non-veg'],
      required: [true, 'Food type is required'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Food price is required'],
      min: [0, 'Food price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      default: null,
      validate: {
        validator(value) {
          if (value == null) return true;
          return value >= this.price;
        },
        message: 'Original price must be greater than or equal to the current price',
      },
    },
    image: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    ingredients: [{ type: String, trim: true, maxlength: 80 }],
    allergens: [{ type: String, trim: true, maxlength: 80 }],
    spiceLevel: {
      type: String,
      enum: ['none', 'mild', 'medium', 'hot', 'extra-hot'],
      default: 'none',
    },
    preparationTime: {
      type: Number,
      min: [0, 'Preparation time cannot be negative'],
      default: null,
    },
    isAvailable: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
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

foodSchema.pre('validate', function setSlug(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  next();
});

module.exports = mongoose.models.Food || mongoose.model('Food', foodSchema);