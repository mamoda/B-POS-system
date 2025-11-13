const express = require('express');
const {
  createPayment,
  getPayment,
  updatePaymentStatus,
  getOrderPayments,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, authorize('staff', 'admin'), createPayment);

router.route('/:paymentId')
  .get(protect, authorize('staff', 'admin'), getPayment);

router.route('/:paymentId/status')
  .put(protect, authorize('staff', 'admin'), updatePaymentStatus);

router.route('/order/:orderId')
  .get(protect, authorize('staff', 'admin'), getOrderPayments);

module.exports = router;
