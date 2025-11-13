const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image_url: {
    type: String,
    default: null,
  },
  available: {
    type: Boolean,
    default: true,
  },
  preparation_time_minutes: {
    type: Number,
    required: true,
    default: 15,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
