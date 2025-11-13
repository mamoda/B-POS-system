const express = require('express');
const {
  createOrder,
  getOrder,
  getOrdersByTable,
  updateOrder,
  updateOrderTotals,
  addOrderItem,
  getOrderItems,
  updateOrderItem,
  deleteOrderItem,
  updateOrderItemStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Order routes
router.route('/')
  .post(protect, authorize('staff', 'admin'), createOrder);

router.route('/:orderId')
  .get(protect, authorize('staff', 'admin'), getOrder)
  .put(protect, authorize('staff', 'admin'), updateOrder);

router.route('/table/:tableNumber')
  .get(protect, authorize('staff', 'admin'), getOrdersByTable);

router.route('/:orderId/totals')
  .put(protect, authorize('staff', 'admin'), updateOrderTotals);

// Order Item routes
router.route('/:orderId/items')
  .post(protect, authorize('staff', 'admin'), addOrderItem)
  .get(protect, authorize('staff', 'admin'), getOrderItems);

router.route('/items/:itemId')
  .put(protect, authorize('staff', 'admin'), updateOrderItem)
  .delete(protect, authorize('staff', 'admin'), deleteOrderItem);

router.route('/items/:itemId/status')
  .put(protect, authorize('kitchen', 'admin'), updateOrderItemStatus);

module.exports = router;
