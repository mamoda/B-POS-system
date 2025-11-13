const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  table_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  table_number: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'ready', 'served', 'paid', 'cancelled'],
    default: 'pending',
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  estimated_ready_time: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', OrderSchema);
