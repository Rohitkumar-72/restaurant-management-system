const Razorpay = require('razorpay');

const getRazorpayConfig = () => ({
  keyId: process.env.RAZORPAY_KEY_ID || '',
  keySecret: process.env.RAZORPAY_KEY_SECRET || '',
});

const getRazorpay = () => {
  const { keyId, keySecret } = getRazorpayConfig();
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured');
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

module.exports = { getRazorpay, getRazorpayConfig };