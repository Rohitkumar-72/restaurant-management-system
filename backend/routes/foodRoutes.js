const express = require('express');
const {
  getFoods,
  getFoodById,
  getFoodsByCategory,
} = require('../controllers/foodController');

const router = express.Router();

router.get('/category/:category', getFoodsByCategory);
router.get('/:id', getFoodById);
router.get('/', getFoods);

module.exports = router;