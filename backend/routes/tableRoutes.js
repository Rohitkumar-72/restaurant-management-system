const express = require('express');
const {
  validateTable,
  listTables,
  createTable,
  updateTable,
  getTableQr,
} = require('../controllers/tableController');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/validate/:identifier', validateTable);
router.get('/', authenticateAdmin, requireAdmin, listTables);
router.post('/', authenticateAdmin, requireAdmin, createTable);
router.patch('/:id', authenticateAdmin, requireAdmin, updateTable);
router.get('/:id/qr', authenticateAdmin, requireAdmin, getTableQr);

module.exports = router;
