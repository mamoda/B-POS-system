// src/routes/menuRoutes.ts
import { Router } from 'express';
import { menuController } from '../controllers/menuController';

const router = Router();

router.get('/menu/items', menuController.getMenuItems);
router.get('/menu/items/:id', menuController.getMenuItem);
router.post('/menu/items', menuController.createMenuItem);
router.put('/menu/items/:id', menuController.updateMenuItem);
router.delete('/menu/items/:id', menuController.deleteMenuItem);
router.get('/menu/categories', menuController.getCategories);

export default router;