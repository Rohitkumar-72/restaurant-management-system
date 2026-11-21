const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { generateToken } = require('../utils/generateToken');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 8 * 60 * 60 * 1000,
  path: '/',
});

exports.adminLogin = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) throw new ApiError(500, 'Authentication is not configured');
    if (mongoose.connection.readyState !== 1) throw new ApiError(503, 'Database is unavailable');

    const { email, password } = req.body;
    const admin = await Admin.findOne({ email, isActive: true }).select('+passwordHash');

    let valid = false;
    if (admin) valid = await bcrypt.compare(password, admin.passwordHash);

    if (!valid) throw new ApiError(401, 'Invalid email or password');

    const token = generateToken(admin);
    res.cookie('admin_session', token, cookieOptions());
    return ApiResponse.success(res, 200, {
      admin: admin.toSafeObject(),
    }, 'Admin login successful');
  } catch (error) {
    return next(error);
  }
};

exports.getAdminSession = async (req, res) =>
  ApiResponse.success(res, 200, {
    admin: req.admin.toSafeObject(),
  }, 'Admin session verified');

exports.adminLogout = (req, res) => {
  res.clearCookie('admin_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
  });
  return ApiResponse.success(res, 200, null, 'Logged out successfully');
};