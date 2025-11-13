const express = require('express');
const {
  getTables,
  getTableByNumber,
  updateTableStatus,
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(getTables);
router.route('/:tableNumber').get(getTableByNumber);
router.route('/:id/status').put(protect, authorize('staff', 'admin'), updateTableStatus);

module.exports = router;
