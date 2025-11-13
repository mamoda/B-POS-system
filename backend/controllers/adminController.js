const OrderItem = require('../models/OrderItem');
const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');

// @desc    Get all pending and in-progress order items for Kitchen Display
// @route   GET /api/v1/orders/kitchen
// @access  Kitchen/Admin
exports.getKitchenOrders = async (req, res, next) => {
  try {
    const kitchenItems = await OrderItem.find({
      status: { $in: ['pending', 'in_progress'] },
    })
      .populate({
        path: 'order_id',
        select: 'table_number',
      })
      .populate({
        path: 'menu_item_id',
        select: 'name',
      })
      .sort('createdAt');

    // Group by order_id and format for kitchen display
    const ordersMap = new Map();
    kitchenItems.forEach(item => {
      const orderId = item.order_id._id.toString();
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          orderId: orderId,
          tableNumber: item.order_id.table_number,
          items: [],
        });
      }
      ordersMap.get(orderId).items.push({
        itemId: item._id,
        name: item.menu_item_id.name,
        quantity: item.quantity,
        instructions: item.special_instructions,
        status: item.status,
        createdAt: item.createdAt,
      });
    });

    res.status(200).json({
      success: true,
      count: ordersMap.size,
      data: Array.from(ordersMap.values()),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/dashboard
// @access  Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total Sales (Completed Orders)
    const totalSalesResult = await Order.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;

    // 2. Total Orders
    const totalOrders = await Order.countDocuments();

    // 3. Available Tables
    const availableTables = await Table.countDocuments({ status: 'available' });
    const totalTables = await Table.countDocuments();

    // 4. Menu Item Count
    const totalMenuItems = await MenuItem.countDocuments();

    // 5. Orders by Status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        availableTables,
        totalTables,
        totalMenuItems,
        ordersByStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
