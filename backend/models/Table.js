const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  table_number: {
    type: Number,
    required: true,
    unique: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'needs_cleaning'],
    default: 'available',
  },
  current_order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Table', TableSchema);
