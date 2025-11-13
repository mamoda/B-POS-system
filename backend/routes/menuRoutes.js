const express = require('express');
const {
  getMenuItems,
  getMenuItemsByCategory,
} = require('../controllers/menuController');

const router = express.Router();

router.route('/').get(getMenuItems);
router.route('/category/:category').get(getMenuItemsByCategory);

module.exports = router;
