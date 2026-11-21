const crypto = require('crypto');
const { getRazorpay } = require('../config/razorpay');

const createRazorpayOrder = (amount, receipt) =>
  getRazorpay().orders.create({
    amount,
    currency: 'INR',
    receipt: receipt.slice(0, 40),
  });

const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, signature }) => {
  if (!process.env.RAZORPAY_KEY_SECRET) return false;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  const supplied = String(signature || '');
  if (!/^[a-f0-9]{64}$/i.test(supplied)) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied, 'hex'));
};

const fetchRazorpayPayment = (paymentId) =>
  getRazorpay().payments.fetch(paymentId);

const createRazorpayRefund = (paymentId, amount) =>
  getRazorpay().refunds.create({
    payment_id: paymentId,
    amount,
  });

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  fetchRazorpayPayment,
  createRazorpayRefund,
};