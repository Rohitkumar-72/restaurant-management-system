const mongoose = require('mongoose');
const Food = require('../models/Food');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const requireDatabase = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new ApiError(503, 'Database is unavailable');
  }
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.getFoods = async (req, res, next) => {
  try {
    requireDatabase();

    const {
      search,
      category,
      foodType,
      available,
      featured,
      sort,
      page = '1',
      limit = '100',
    } = req.query;

    if (search && (typeof search !== 'string' || search.length > 100)) {
      throw new ApiError(400, 'Search must be a string of 100 characters or less');
    }
    if (foodType && !['veg', 'non-veg'].includes(foodType)) {
      throw new ApiError(400, 'foodType must be veg or non-veg');
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      throw new ApiError(400, 'Page must be a positive integer');
    }
    if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      throw new ApiError(400, 'Limit must be between 1 and 100');
    }

    const filter = { isAvailable: true };
    if (search) {
      const pattern = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: pattern, $options: 'i' } },
        { category: { $regex: pattern, $options: 'i' } },
        { description: { $regex: pattern, $options: 'i' } },
      ];
    }
    if (category) filter.category = { $regex: `^${escapeRegex(category.trim())}$`, $options: 'i' };
    if (foodType) filter.foodType = foodType;
    if (available !== undefined) {
      if (!['true', 'false'].includes(available)) throw new ApiError(400, 'available must be true or false');
      if (available === 'false') {
        throw new ApiError(403, 'Unavailable foods are restricted');
      }
      filter.isAvailable = true;
    }
    if (featured !== undefined) {
      if (!['true', 'false'].includes(featured)) throw new ApiError(400, 'featured must be true or false');
      filter.isFeatured = featured === 'true';
    }

    const allowedSort = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      name: { name: 1 },
    };
    if (sort && !allowedSort[sort]) throw new ApiError(400, 'Invalid sort value');

    const skip = (pageNumber - 1) * limitNumber;
    const [items, total] = await Promise.all([
      Food.find(filter)
        .sort(allowedSort[sort] || { isFeatured: -1, name: 1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Food.countDocuments(filter),
    ]);

    return ApiResponse.success(res, 200, {
      items,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    }, 'Foods fetched successfully');
  } catch (error) {
    return next(error);
  }
};

exports.getFoodById = async (req, res, next) => {
  try {
    requireDatabase();
    const { id } = req.params;
    if (!id || id.length > 120) throw new ApiError(400, 'Invalid food identifier');

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { slug: id }] }
      : { slug: id };
    const food = await Food.findOne({ ...query, isAvailable: true }).lean();

    if (!food) throw new ApiError(404, 'Food not found');
    return ApiResponse.success(res, 200, food, 'Food fetched successfully');
  } catch (error) {
    return next(error);
  }
};

exports.getFoodsByCategory = async (req, res, next) => {
  try {
    requireDatabase();
    const category = req.params.category;
    if (!category || category.length > 80) throw new ApiError(400, 'Invalid category');

    const items = await Food.find({
      isAvailable: true,
      category: { $regex: `^${escapeRegex(category)}$`, $options: 'i' },
    }).sort({ isFeatured: -1, name: 1 }).lean();

    return ApiResponse.success(res, 200, items, 'Foods fetched successfully');
  } catch (error) {
    return next(error);
  }
};