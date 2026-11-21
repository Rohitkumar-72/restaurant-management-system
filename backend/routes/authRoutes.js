const express = require('express');
const {
  adminLogin,
  getAdminSession,
  adminLogout,
} = require('../controllers/authController');
const { adminLoginLimiter } = require('../middleware/rateLimitMiddleware');
const { validateAdminLogin } = require('../middleware/validateMiddleware');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/admin/login', adminLoginLimiter, validateAdminLogin, adminLogin);
router.get('/admin/me', authenticateAdmin, requireAdmin, getAdminSession);
router.post('/admin/logout', authenticateAdmin, requireAdmin, adminLogout);

module.exports = router;