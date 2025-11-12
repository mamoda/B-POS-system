// src/routes/orderRoutes.ts
import { Router } from 'express';
import { orderController } from '../controllers/orderController';

const router = Router();

router.post('/orders', orderController.createOrder);
router.get('/orders/:id', orderController.getOrder);
router.get('/orders/table/:tableNumber', orderController.getOrdersByTable);
router.post('/orders/:orderId/items', orderController.addOrderItem);
router.put('/orders/:id/status', orderController.updateOrderStatus);
router.get('/orders/kitchen/active', orderController.getActiveOrders);
router.put('/order-items/:itemId/status', orderController.updateOrderItemStatus);

export default router;