const express = require('express');
const {
  getConfig,
  createPaymentOrder,
  verifyPayment,
  paymentFailure,
  refundPayment,
} = require('../controllers/paymentController');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/config', getConfig);
router.post('/create/:orderId', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/failure', paymentFailure);
router.post('/:orderId/refund', authenticateAdmin, requireAdmin, refundPayment);

module.exports = router;