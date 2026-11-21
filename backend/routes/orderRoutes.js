const express = require('express');
const {
  createOrder,
  trackOrder,
  listOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', createOrder);
router.get('/track/:orderNumber', trackOrder);
router.get('/', authenticateAdmin, requireAdmin, listOrders);
router.patch('/:id/status', authenticateAdmin, requireAdmin, updateOrderStatus);

module.exports = router;