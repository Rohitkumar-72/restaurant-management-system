const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/generateToken');

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.admin_session;
    if (!token) throw new ApiError(401, 'Authentication required');

    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      throw new ApiError(401, 'Session expired or invalid');
    }

    if (mongoose.connection.readyState !== 1) {
      throw new ApiError(503, 'Database is unavailable');
    }

    const admin = await Admin.findById(payload.sub).select('+passwordHash');
    if (!admin || !admin.isActive) throw new ApiError(401, 'Session expired or invalid');

    req.admin = admin;
    req.adminId = admin._id;
    req.userRole = admin.role;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { authenticateAdmin };