import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// View stock movements: ADMIN, WAREHOUSE
router.get('/stock-movements', authorize(Role.ADMIN, Role.WAREHOUSE), InventoryController.getStockMovements);

export default router;
