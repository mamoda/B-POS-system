const express = require('express');
const { getKitchenOrders, getDashboardStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Kitchen Display Route
router.route('/kitchen')
  .get(protect, authorize('kitchen', 'admin'), getKitchenOrders);

// Admin Dashboard Route
router.route('/dashboard')
  .get(protect, authorize('admin'), getDashboardStats);

module.exports = router;
