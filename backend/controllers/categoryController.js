const mongoose = require('mongoose');
const Category = require('../models/Category');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const requireDatabase = () => {
  if (mongoose.connection.readyState !== 1) throw new ApiError(503, 'Database is unavailable');
};

exports.getCategories = async (req, res, next) => {
  try {
    requireDatabase();
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    return ApiResponse.success(res, 200, categories, 'Categories fetched successfully');
  } catch (error) {
    return next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    requireDatabase();
    const { id } = req.params;
    if (!id || id.length > 120) throw new ApiError(400, 'Invalid category identifier');

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { slug: id }] }
      : { slug: id };
    const category = await Category.findOne({ ...query, isActive: true }).lean();
    if (!category) throw new ApiError(404, 'Category not found');
    return ApiResponse.success(res, 200, category, 'Category fetched successfully');
  } catch (error) {
    return next(error);
  }
};