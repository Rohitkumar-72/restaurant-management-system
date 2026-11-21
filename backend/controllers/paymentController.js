const mongoose = require('mongoose');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  fetchRazorpayPayment,
  createRazorpayRefund,
} = require('../services/paymentService');
const { getRazorpayConfig } = require('../config/razorpay');

const requireDatabase = () => {
  if (mongoose.connection.readyState !== 1) throw new ApiError(503, 'Database is unavailable');
};

exports.getConfig = (req, res) => {
  const { keyId } = getRazorpayConfig();
  if (!keyId) return ApiResponse.error(res, 503, 'Razorpay is not configured');
  return ApiResponse.success(res, 200, { keyId, currency: 'INR' }, 'Razorpay configuration available');
};

exports.createPaymentOrder = async (req, res, next) => {
  try {
    requireDatabase();
    const order = await Order.findById(req.params.orderId).select('+trackingToken');
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.paymentMethod !== 'razorpay') throw new ApiError(400, 'This order does not use online payment');
    if (order.paymentStatus === 'PAID') throw new ApiError(409, 'This order is already paid');

    let payment = await Payment.findOne({ order: order._id });
    if (payment?.razorpayOrderId && payment.status === 'PENDING') {
      return ApiResponse.success(res, 200, {
        keyId: getRazorpayConfig().keyId,
        currency: 'INR',
        amount: payment.amount,
        razorpayOrderId: payment.razorpayOrderId,
      }, 'Existing payment order returned');
    }

    const amount = Math.round(order.total * 100);
    if (!Number.isInteger(amount) || amount < 100) throw new ApiError(400, 'Invalid payable amount');
    const razorpayOrder = await createRazorpayOrder(amount, order.orderNumber);

    payment = await Payment.findOneAndUpdate(
      { order: order._id },
      {
        order: order._id,
        razorpayOrderId: razorpayOrder.id,
        currency: 'INR',
        amount,
        status: 'PENDING',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    order.razorpayOrderId = razorpayOrder.id;
    order.paymentStatus = 'PENDING';
    await order.save();

    return ApiResponse.success(res, 201, {
      keyId: getRazorpayConfig().keyId,
      currency: 'INR',
      amount,
      razorpayOrderId: razorpayOrder.id,
      internalOrderId: order._id,
    }, 'Payment order created');
  } catch (error) {
    return next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    requireDatabase();
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!mongoose.Types.ObjectId.isValid(orderId)) throw new ApiError(400, 'Invalid internal order');
    if (!verifyPaymentSignature({ razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, signature: razorpay_signature })) {
      throw new ApiError(400, 'Payment signature verification failed');
    }

    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.paymentMethod !== 'razorpay') throw new ApiError(400, 'This order does not use online payment');
    const payment = await Payment.findOne({ order: order._id });
    if (!payment || payment.razorpayOrderId !== razorpay_order_id) {
      throw new ApiError(400, 'Payment is not associated with this order');
    }
    if (payment.status === 'PAID') {
      return ApiResponse.success(res, 200, { paymentStatus: 'PAID' }, 'Payment already verified');
    }

    let razorpayPayment;
    try {
      razorpayPayment = await fetchRazorpayPayment(razorpay_payment_id);
    } catch (error) {
      throw new ApiError(502, 'Unable to verify payment with Razorpay');
    }
    if (
      razorpayPayment.order_id !== razorpay_order_id ||
      razorpayPayment.amount !== payment.amount ||
      razorpayPayment.currency !== 'INR' ||
      razorpayPayment.status !== 'captured'
    ) {
      payment.status = 'FAILED';
      payment.failureReason = 'Razorpay did not pass amount, currency, or captured-state validation';
      await payment.save();
      order.paymentStatus = 'FAILED';
      await order.save();
      throw new ApiError(400, 'Payment verification failed');
    }

    payment.status = 'PAID';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.method = razorpayPayment.method || '';
    payment.paidAt = new Date();
    await payment.save();
    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentStatus = 'PAID';
    order.paidAt = payment.paidAt;
    order.orderStatus = 'CONFIRMED';
    await order.save();

    const safe = publicPaymentOrder(order);
    req.app.get('io')?.to('admins').emit('order:new', safe);
    req.app.get('io')?.to('admins').emit('order:status-changed', safe);
    req.app.get('io')?.to(`order:${order._id}`).emit('order:status-changed', safe);
    return ApiResponse.success(res, 200, { order: safe, paymentStatus: 'PAID' }, 'Payment verified');
  } catch (error) {
    return next(error);
  }
};

exports.paymentFailure = async (req, res, next) => {
  try {
    requireDatabase();
    const { orderId, reason } = req.body;
    if (!mongoose.Types.ObjectId.isValid(orderId)) throw new ApiError(400, 'Invalid internal order');
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.paymentStatus === 'PAID') throw new ApiError(409, 'This order is already paid');
    const payment = await Payment.findOne({ order: order._id });
    if (payment) {
      payment.status = 'FAILED';
      payment.failureReason = typeof reason === 'string' ? reason.slice(0, 500) : 'Payment cancelled or failed';
      await payment.save();
    }
    order.paymentStatus = 'FAILED';
    await order.save();
    return ApiResponse.success(res, 200, { paymentStatus: 'FAILED' }, 'Payment failure recorded');
  } catch (error) {
    return next(error);
  }
};

exports.refundPayment = async (req, res, next) => {
  try {
    requireDatabase();
    const { amount } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) throw new ApiError(404, 'Order not found');
    const payment = await Payment.findOne({ order: order._id });
    if (!payment?.razorpayPaymentId) throw new ApiError(400, 'No captured payment exists');
    if (payment.status === 'REFUNDED') throw new ApiError(409, 'Payment is already fully refunded');

    const requested = amount == null ? payment.amount : Math.round(Number(amount) * 100);
    if (!Number.isInteger(requested) || requested < 100 || requested > payment.amount) {
      throw new ApiError(400, 'Invalid refund amount');
    }
    const alreadyProcessed = payment.refunds.some((refund) =>
      refund.status === 'PROCESSED' && refund.amount * 100 === requested,
    );
    if (alreadyProcessed) throw new ApiError(409, 'Duplicate refund detected');

    const refund = await createRazorpayRefund(payment.razorpayPaymentId, requested);
    payment.refunds.push({
      refundId: refund.id,
      amount: requested / 100,
      currency: 'INR',
      status: refund.status === 'processed' ? 'PROCESSED' : 'PENDING',
    });
    const processedTotal = payment.refunds
      .filter((refund) => refund.status === 'PROCESSED')
      .reduce((sum, refund) => sum + refund.amount * 100, 0);
    payment.status = processedTotal >= payment.amount ? 'REFUNDED' : 'PAID';
    await payment.save();
    if (payment.status === 'REFUNDED') {
      order.paymentStatus = 'REFUNDED';
      await order.save();
    }
    return ApiResponse.success(res, 200, { refundId: refund.id, status: refund.status }, 'Refund initiated');
  } catch (error) {
    return next(error);
  }
};

const publicPaymentOrder = (order) => {
  const value = order.toObject ? order.toObject() : { ...order };
  const { trackingToken, idempotencyKey, __v, ...safe } = value;
  return safe;
};