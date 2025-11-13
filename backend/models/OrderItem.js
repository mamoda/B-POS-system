const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  menu_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unit_price: {
    type: Number,
    required: true,
  },
  special_instructions: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'ready', 'served'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('OrderItem', OrderItemSchema);
