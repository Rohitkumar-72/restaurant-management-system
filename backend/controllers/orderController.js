const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Food = require('../models/Food');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const ORDER_TRANSITIONS = {
  PLACED: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['SERVED', 'CANCELLED'],
  SERVED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

const requireDatabase = () => {
  if (mongoose.connection.readyState !== 1) throw new ApiError(503, 'Database is unavailable');
};

const generateOrderNumber = () => `SV-${Date.now().toString().slice(-8)}-${crypto.randomBytes(2).toString('hex').toUpper()} `;

exports.createOrder = async (req, res, next) => {
  try {
    requireDatabase();
    const idempotencyKey = req.get('Idempotency-Key') || req.body.idempotencyKey;
    if (idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey }).select('+trackingToken');
      if (existing) return ApiResponse.success(res, 200, publicOrder(existing, true), 'Existing order returned');
    }

    const { customer, items, orderType, tableNumber, specialInstructions, paymentMethod } = req.body;
    if (!customer?.name || !customer?.mobile) throw new ApiError(400, 'Customer name and mobile number are required');
    if (!/^[6-9]\d{9}$/.test(String(customer.mobile).replace(/\D/g, '').slice(-10))) {
      throw new ApiError(400, 'Enter a valid 10-digit mobile number');
    }
    if (!['dine-in', 'takeaway'].includes(orderType)) throw new ApiError(400, 'Invalid order type');
    if (orderType === 'dine-in' && (!tableNumber || !/^\d{1,3}$/.test(String(tableNumber)))) {
      throw new ApiError(400, 'A valid table number is required');
    }
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      throw new ApiError(400, 'Cart must contain between 1 and 50 items');
    }

    const normalized = [];
    for (const item of items) {
      if (!item?.foodId) throw new ApiError(400, 'Invalid cart item');
      if (!mongoose.Types.ObjectId.isValid(item.foodId)) throw new ApiError(400, 'Invalid food identifier');
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        throw new ApiError(400, 'Invalid item quantity');
      }
      normalized.push(item);
    }

    const foodIds = [...new Set(normalized.map((item) => item.foodId))];
    const foods = await Food.find({ _id: { $in: foodIds }, isAvailable: true }).lean();
    if (foods.length !== foodIds.length) throw new ApiError(400, 'One or more menu items are unavailable');

    const foodMap = new Map(foods.map((food) => [food._id.toString(), food]));
    let subtotal = 0;
    let discount = 0;
    const snapshots = normalized.map((item) => {
      const food = foodMap.get(item.foodId);
      const unitPrice = food.price;
      const itemTotal = Number((unitPrice * item.quantity).toFixed(2));
      subtotal += itemTotal;
      if (food.originalPrice && food.originalPrice > unitPrice) {
        discount += Number(((food.originalPrice - unitPrice) * item.quantity).toFixed(2));
      }
      return {
        foodId: food._id,
        name: food.name,
        image: food.image || '',
        unitPrice,
        quantity: item.quantity,
        itemTotal,
      };
    });

    const order = await Order.create({
      orderNumber: generateOrderNumber().trim(),
      trackingToken: crypto.randomBytes(24).toString('hex'),
      idempotencyKey: idempotencyKey?.slice(0, 100),
      customer: {
        name: customer.name.trim().slice(0, 100),
        mobile: String(customer.mobile).replace(/\D/g, '').slice(-10),
      },
      items: snapshots,
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total: Number(subtotal.toFixed(2)),
      orderType,
      tableNumber: orderType === 'dine-in' ? String(tableNumber).trim() : null,
      specialInstructions: typeof specialInstructions === 'string' ? specialInstructions.trim().slice(0, 1000) : '',
      paymentMethod: ['cash', 'pay_at_counter', 'not_required', 'razorpay'].includes(paymentMethod)
        ? paymentMethod
        : 'pay_at_counter',
      paymentStatus: paymentMethod === 'razorpay' ? 'PENDING' : 'not_required',
      orderStatus: 'PLACED',
      estimatedMinutes: 25,
    });

    if (order.paymentMethod !== 'razorpay') {
      req.app.get('io')?.to('admins').emit('order:new', publicOrder(order));
    }
    return ApiResponse.success(res, 201, publicOrder(order, true), 'Order created');
  } catch (error) {
    if (error.code === 11000) {
      const existing = await Order.findOne({ idempotencyKey: req.get('Idempotency-Key') || req.body.idempotencyKey }).select('+trackingToken');
      if (existing) return ApiResponse.success(res, 200, publicOrder(existing, true), 'Existing order returned');
    }
    return next(error);
  }
};

const publicOrder = (order, includeTrackingToken = false) => {
  const value = order.toObject ? order.toObject() : { ...order };
  const { trackingToken, idempotencyKey, __v, ...safe } = value;
  if (includeTrackingToken && trackingToken) safe.trackingToken = trackingToken;
  return safe;
};

exports.trackOrder = async (req, res, next) => {
  try {
    requireDatabase();
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber,
      'customer.mobile': String(req.query.mobile || '').replace(/\D/g, '').slice(-10),
    }).select('+trackingToken');
    if (!order) throw new ApiError(404, 'Order not found');
    if (req.query.token && req.query.token !== order.trackingToken) throw new ApiError(403, 'Invalid tracking token');
    if (!req.query.token) throw new ApiError(400, 'Tracking token is required');
    return ApiResponse.success(res, 200, publicOrder(order), 'Order fetched successfully');
  } catch (error) {
    return next(error);
  }
};

exports.listOrders = async (req, res, next) => {
  try {
    requireDatabase();
    const filter = {};
    if (req.query.status) {
      const status = String(req.query.status).toUpperCase();
      if (!Object.keys(ORDER_TRANSITIONS).includes(status)) throw new ApiError(400, 'Invalid order status');
      filter.orderStatus = status;
    }
    if (req.query.search) filter.orderNumber = { $regex: req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    const items = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    return ApiResponse.success(res, 200, items, 'Orders fetched successfully');
  } catch (error) {
    return next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    requireDatabase();
    const status = String(req.body.status || '').toUpperCase();
    if (!['CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED', 'REJECTED'].includes(status)) {
      throw new ApiError(400, 'Invalid order status');
    }
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, 'Order not found');
    if (!ORDER_TRANSITIONS[order.orderStatus]?.includes(status)) {
      throw new ApiError(400, `Cannot transition from ${order.orderStatus} to ${status}`);
    }
    order.orderStatus = status;
    if (status === 'REJECTED' || status === 'CANCELLED') {
      order.rejectionReason = typeof req.body.reason === 'string' ? req.body.reason.slice(0, 300) : '';
    }
    await order.save();
    const safe = publicOrder(order);
    req.app.get('io')?.to('admins').emit('order:status-changed', safe);
    req.app.get('io')?.to(`order:${order._id}`).emit('order:status-changed', safe);
    return ApiResponse.success(res, 200, safe, 'Order status updated');
  } catch (error) {
    return next(error);
  }
};