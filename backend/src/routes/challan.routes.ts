import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createChallanSchema, updateChallanSchema } from '../validators/challan.validator.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// View challans: ADMIN, SALES, WAREHOUSE, ACCOUNTS
router.get('/', authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), ChallanController.getChallans);
router.get('/:id', authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), ChallanController.getChallanById);
router.get('/:id/print', authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), ChallanController.printChallan);

// Create / edit draft challans: ADMIN, SALES
router.post('/', authorize(Role.ADMIN, Role.SALES), validateRequest(createChallanSchema), ChallanController.createChallan);
router.put('/:id', authorize(Role.ADMIN, Role.SALES), validateRequest(updateChallanSchema), ChallanController.updateChallan);

// Confirm challan: ADMIN, SALES
router.post('/:id/confirm', authorize(Role.ADMIN, Role.SALES), ChallanController.confirmChallan);

// Cancel challan: ADMIN only
router.post('/:id/cancel', authorize(Role.ADMIN), ChallanController.cancelChallan);

export default router;
