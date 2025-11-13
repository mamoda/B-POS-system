const Table = require('../models/Table');

// @desc    Get all tables
// @route   GET /api/v1/tables
// @access  Public (for now, will be protected later)
exports.getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().sort('table_number');
    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get a single table by number
// @route   GET /api/v1/tables/:tableNumber
// @access  Public (for now, will be protected later)
exports.getTableByNumber = async (req, res, next) => {
  try {
    const table = await Table.findOne({ table_number: req.params.tableNumber });

    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update table status
// @route   PUT /api/v1/tables/:id/status
// @access  Staff/Admin
exports.updateTableStatus = async (req, res, next) => {
  try {
    const { status, current_order_id } = req.body;

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      {
        status,
        current_order_id: current_order_id || null,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
