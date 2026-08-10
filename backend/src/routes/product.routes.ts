import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createProductSchema, updateProductSchema, stockInSchema } from '../validators/product.validator.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// View products & categories: ADMIN, SALES, WAREHOUSE
router.get('/categories', authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE), ProductController.getCategories);
router.get('/warehouses', authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE), ProductController.getWarehouses);
router.get('/', authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE), ProductController.getProducts);
router.get('/:id', authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE), ProductController.getProductById);
router.get('/:id/stock-movements', authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE), ProductController.getProductStockMovements);

// Manage products: ADMIN only
router.post('/', authorize(Role.ADMIN), validateRequest(createProductSchema), ProductController.createProduct);
router.put('/:id', authorize(Role.ADMIN), validateRequest(updateProductSchema), ProductController.updateProduct);

// Stock-IN: ADMIN, WAREHOUSE
router.post('/:id/stock-in', authorize(Role.ADMIN, Role.WAREHOUSE), validateRequest(stockInSchema), ProductController.stockIn);

export default router;
