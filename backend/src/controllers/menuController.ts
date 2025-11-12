// src/controllers/menuController.ts
import { Request, Response } from 'express';
import { db } from '../services/database';
import Joi from 'joi';

const menuItemSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  category: Joi.string().required(),
  price: Joi.number().min(0).required(),
  image_url: Joi.string().uri().allow(''),
  available: Joi.boolean().default(true),
  preparation_time_minutes: Joi.number().integer().min(1).default(15)
});

export const menuController = {
  async getMenuItems(req: Request, res: Response) {
    try {
      const { category } = req.query;
      const items = await db.getMenuItems(category as string);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch menu items' });
    }
  },

  async getMenuItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await db.getMenuItem(id);
      res.json(item);
    } catch (error) {
      res.status(404).json({ error: 'Menu item not found' });
    }
  },

  async createMenuItem(req: Request, res: Response) {
    try {
      const { error, value } = menuItemSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const menuItem = await db.createMenuItem(value);
      res.status(201).json(menuItem);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create menu item' });
    }
  },

  async updateMenuItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error, value } = menuItemSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const menuItem = await db.updateMenuItem(id, value);
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update menu item' });
    }
  },

  async deleteMenuItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await db.deleteMenuItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete menu item' });
    }
  },

  async getCategories(req: Request, res: Response) {
    try {
      const items = await db.getMenuItems();
      const categories = [...new Set(items.map(item => item.category))];
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }
};