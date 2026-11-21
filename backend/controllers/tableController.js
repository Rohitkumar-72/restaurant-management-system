const mongoose = require('mongoose');
const QRCode = require('qrcode');
const RestaurantTable = require('../models/Table');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const requireDatabase = () => {
  if (mongoose.connection.readyState !== 1) throw new ApiError(503, 'Database is unavailable');
};

const slugIdentifier = (value) =>
  String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

exports.validateTable = async (req, res, next) => {
  try {
    requireDatabase();
    const identifier = slugIdentifier(req.params.identifier);
    if (!identifier) throw new ApiError(400, 'Invalid table identifier');
    const table = await RestaurantTable.findOne({ qrIdentifier: identifier }).lean();
    if (!table) throw new ApiError(404, 'Table not found');
    if (!table.isActive) throw new ApiError(403, 'This table is currently inactive');
    return ApiResponse.success(res, 200, {
      id: table._id,
      tableNumber: table.tableNumber,
      qrIdentifier: table.qrIdentifier,
      status: table.status,
    }, 'Table validated');
  } catch (error) {
    return next(error);
  }
};

exports.listTables = async (req, res, next) => {
  try {
    requireDatabase();
    const filter = {};
    if (req.query.status) {
      if (!['AVAILABLE', 'OCCUPIED', 'ORDERING', 'RESERVED'].includes(req.query.status)) {
        throw new ApiError(400, 'Invalid table status');
      }
      filter.status = req.query.status;
    }
    if (req.query.active !== undefined) {
      if (!['true', 'false'].includes(req.query.active)) throw new ApiError(400, 'Invalid active value');
      filter.isActive = req.query.active === 'true';
    }
    if (req.query.search) {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.tableNumber = { $regex: escaped, $options: 'i' };
    }
    const tables = await RestaurantTable.find(filter).sort({ tableNumber: 1 }).lean();
    return ApiResponse.success(res, 200, tables, 'Tables fetched successfully');
  } catch (error) {
    return next(error);
  }
};

exports.createTable = async (req, res, next) => {
  try {
    requireDatabase();
    const tableNumber = typeof req.body.tableNumber === 'string' ? req.body.tableNumber.trim() : '';
    if (!tableNumber || tableNumber.length > 20) throw new ApiError(400, 'A valid table number is required');
    const qrIdentifier = slugIdentifier(req.body.qrIdentifier || `table-${tableNumber}`);
    if (!qrIdentifier) throw new ApiError(400, 'A valid QR identifier is required');
    const capacity = req.body.capacity == null ? 4 : Number(req.body.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 200) {
      throw new ApiError(400, 'Capacity must be between 1 and 200');
    }
    const existing = await RestaurantTable.findOne({
      $or: [{ tableNumber }, { qrIdentifier }],
    });
    if (existing) throw new ApiError(409, 'Table number or QR identifier already exists');

    const table = await RestaurantTable.create({
      tableNumber,
      qrIdentifier,
      capacity,
      isActive: req.body.isActive !== false,
      status: ['AVAILABLE', 'OCCUPIED', 'ORDERING', 'RESERVED'].includes(req.body.status)
        ? req.body.status
        : 'AVAILABLE',
    });
    return ApiResponse.success(res, 201, table, 'Table created');
  } catch (error) {
    if (error.code === 11000) return next(new ApiError(409, 'Table number or QR identifier already exists'));
    return next(error);
  }
};

exports.updateTable = async (req, res, next) => {
  try {
    requireDatabase();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ApiError(400, 'Invalid table identifier');
    const table = await RestaurantTable.findById(req.params.id);
    if (!table) throw new ApiError(404, 'Table not found');

    if (req.body.tableNumber !== undefined) {
      const tableNumber = String(req.body.tableNumber).trim();
      if (!tableNumber || tableNumber.length > 20) throw new ApiError(400, 'A valid table number is required');
      table.tableNumber = tableNumber;
    }
    if (req.body.qrIdentifier !== undefined) {
      const qrIdentifier = slugIdentifier(req.body.qrIdentifier);
      if (!qrIdentifier) throw new ApiError(400, 'A valid QR identifier is required');
      table.qrIdentifier = qrIdentifier;
    }
    if (req.body.capacity !== undefined) {
      const capacity = Number(req.body.capacity);
      if (!Number.isInteger(capacity) || capacity < 1 || capacity > 200) {
        throw new ApiError(400, 'Capacity must be between 1 and 200');
      }
      table.capacity = capacity;
    }
    if (req.body.isActive !== undefined) table.isActive = Boolean(req.body.isActive);
    if (req.body.status !== undefined) {
      if (!['AVAILABLE', 'OCCUPIED', 'ORDERING', 'RESERVED'].includes(req.body.status)) {
        throw new ApiError(400, 'Invalid table status');
      }
      table.status = req.body.status;
    }
    await table.save();
    return ApiResponse.success(res, 200, table, 'Table updated');
  } catch (error) {
    if (error.code === 11000) return next(new ApiError(409, 'Table number or QR identifier already exists'));
    return next(error);
  }
};

exports.getTableQr = async (req, res, next) => {
  try {
    requireDatabase();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ApiError(400, 'Invalid table identifier');
    const table = await RestaurantTable.findById(req.params.id).lean();
    if (!table) throw new ApiError(404, 'Table not found');
    const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const target = `${baseUrl}/menu?table=${encodeURIComponent(table.qrIdentifier)}`;
    const dataUrl = await QRCode.toDataURL(target, {
      width: 600,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#0b0b0c', light: '#ffffff' },
    });
    return ApiResponse.success(res, 200, {
      tableNumber: table.tableNumber,
      qrIdentifier: table.qrIdentifier,
      target,
      dataUrl,
    }, 'QR code generated');
  } catch (error) {
    return next(error);
  }
};
