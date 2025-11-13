const Payment = require('../models/Payment');
const Order = require('../models/Order');

// @desc    Create a new payment record
// @route   POST /api/v1/payments
// @access  Staff/Admin
exports.createPayment = async (req, res, next) => {
  try {
    const { order_id, amount, payment_method } = req.body;

    const payment = await Payment.create({
      order_id,
      amount,
      payment_method,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get a specific payment
// @route   GET /api/v1/payments/:paymentId
// @access  Staff/Admin
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update payment status
// @route   PUT /api/v1/payments/:paymentId/status
// @access  Staff/Admin
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, stripe_payment_intent_id } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.paymentId,
      { status, stripe_payment_intent_id },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    // If payment is completed, update the order status to 'paid'
    if (status === 'completed') {
      await Order.findByIdAndUpdate(payment.order_id, { status: 'paid' });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all payments for an order
// @route   GET /api/v1/payments/order/:orderId
// @access  Staff/Admin
exports.getOrderPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ order_id: req.params.orderId });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
