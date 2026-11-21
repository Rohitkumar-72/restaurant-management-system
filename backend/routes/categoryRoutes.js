const express = require('express');
const { getCategories, getCategoryById } = require('../controllers/categoryController');

const router = express.Router();

router.get('/:id', getCategoryById);
router.get('/', getCategories);

module.exports = router;