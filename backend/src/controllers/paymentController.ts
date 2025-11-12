// src/controllers/paymentController.ts
import { Request, Response } from 'express';
import { db } from '../services/database';
import Joi from 'joi';

const createPaymentSchema = Joi.object({
  order_id: Joi.string().uuid().required(),
  amount: Joi.number().min(0).required(),
  payment_method: Joi.string().valid('card', 'wallet', 'cash').required(),
  transaction_id: Joi.string().allow('')
});

export const paymentController = {
  async createPayment(req: Request, res: Response) {
    try {
      const { error, value } = createPaymentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const payment = await db.createPayment({
        ...value,
        status: 'completed' // In real app, this would depend on payment gateway response
      });

      // Update order status to completed
      await db.updateOrder(value.order_id, { status: 'completed' });

      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to process payment' });
    }
  },

  async getPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Implementation for getting payment details
      res.json({ message: 'Get payment endpoint' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch payment' });
    }
  }
};