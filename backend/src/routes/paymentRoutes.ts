// src/routes/paymentRoutes.ts
import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';

const router = Router();

router.post('/payments', paymentController.createPayment);
router.get('/payments/:id', paymentController.getPayment);

export default router;