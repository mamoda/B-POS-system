const MenuItem = require('../models/MenuItem');

// @desc    Get all available menu items
// @route   GET /api/v1/menu
// @access  Public
exports.getMenuItems = async (req, res, next) => {
  try {
    const menuItems = await MenuItem.find({ available: true }).sort('category');
    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get menu items by category
// @route   GET /api/v1/menu/category/:category
// @access  Public
exports.getMenuItemsByCategory = async (req, res, next) => {
  try {
    const menuItems = await MenuItem.find({
      category: req.params.category,
      available: true,
    }).sort('name');

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
