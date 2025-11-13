const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');

// @desc    Create a new order
// @route   POST /api/v1/orders
// @access  Staff/Admin
exports.createOrder = async (req, res, next) => {
  try {
    const { table_id, table_number } = req.body;

    const order = await Order.create({
      table_id,
      table_number,
      status: 'pending',
    });

    // Update table status to occupied and link the new order
    await Table.findByIdAndUpdate(table_id, {
      status: 'occupied',
      current_order_id: order._id,
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get a specific order
// @route   GET /api/v1/orders/:orderId
// @access  Staff/Admin
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get orders for a specific table
// @route   GET /api/v1/orders/table/:tableNumber
// @access  Staff/Admin
exports.getOrdersByTable = async (req, res, next) => {
  try {
    const orders = await Order.find({ table_number: req.params.tableNumber }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update order details (e.g., status)
// @route   PUT /api/v1/orders/:orderId
// @access  Staff/Admin
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.orderId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Recalculate and update order totals
// @route   PUT /api/v1/orders/:orderId/totals
// @access  Staff/Admin
exports.updateOrderTotals = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    const items = await OrderItem.find({ order_id: orderId });

    if (!items || items.length === 0) {
      // Reset totals if no items
      const order = await Order.findByIdAndUpdate(orderId, {
        subtotal: 0,
        tax: 0,
        total: 0,
        estimated_ready_time: null,
      }, { new: true });

      return res.status(200).json({
        success: true,
        data: order,
      });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const TAX_RATE = 0.1; // 10% tax
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    // Calculate estimated ready time (simple logic: 15 minutes per item type)
    const maxPrepTime = 15; // Assuming a fixed max prep time for simplicity, as we don't have prep time per item in the current item list
    const estimated_ready_time = new Date(Date.now() + maxPrepTime * 60000);

    const order = await Order.findByIdAndUpdate(orderId, {
      subtotal,
      tax,
      total,
      estimated_ready_time,
    }, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Order Item Controllers ---

// @desc    Add a new item to an order
// @route   POST /api/v1/orders/:orderId/items
// @access  Staff/Admin
exports.addOrderItem = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const { menu_item_id, quantity, special_instructions } = req.body;

    // Get the current price from MenuItem
    const menuItem = await MenuItem.findById(menu_item_id);
    if (!menuItem) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    const unit_price = menuItem.price;

    const orderItem = await OrderItem.create({
      order_id: orderId,
      menu_item_id,
      quantity,
      unit_price,
      special_instructions,
    });

    // Recalculate totals
    await exports.updateOrderTotals({ params: { orderId } }, {}); // Call the total update function internally

    res.status(201).json({
      success: true,
      data: orderItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all items for an order
// @route   GET /api/v1/orders/:orderId/items
// @access  Staff/Admin
exports.getOrderItems = async (req, res, next) => {
  try {
    const orderItems = await OrderItem.find({ order_id: req.params.orderId }).populate('menu_item_id');

    res.status(200).json({
      success: true,
      count: orderItems.length,
      data: orderItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update an order item's quantity
// @route   PUT /api/v1/orders/items/:itemId
// @access  Staff/Admin
exports.updateOrderItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const orderItem = await OrderItem.findByIdAndUpdate(
      req.params.itemId,
      { quantity },
      { new: true, runValidators: true }
    );

    if (!orderItem) {
      return res.status(404).json({ success: false, error: 'Order item not found' });
    }

    // Recalculate totals
    await exports.updateOrderTotals({ params: { orderId: orderItem.order_id } }, {});

    res.status(200).json({
      success: true,
      data: orderItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete an order item
// @route   DELETE /api/v1/orders/items/:itemId
// @access  Staff/Admin
exports.deleteOrderItem = async (req, res, next) => {
  try {
    const orderItem = await OrderItem.findById(req.params.itemId);

    if (!orderItem) {
      return res.status(404).json({ success: false, error: 'Order item not found' });
    }

    const orderId = orderItem.order_id;
    await orderItem.deleteOne();

    // Recalculate totals
    await exports.updateOrderTotals({ params: { orderId } }, {});

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update an order item's status
// @route   PUT /api/v1/orders/items/:itemId/status
// @access  Kitchen/Admin
exports.updateOrderItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const orderItem = await OrderItem.findByIdAndUpdate(
      req.params.itemId,
      { status },
      { new: true, runValidators: true }
    );

    if (!orderItem) {
      return res.status(404).json({ success: false, error: 'Order item not found' });
    }

    res.status(200).json({
      success: true,
      data: orderItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
