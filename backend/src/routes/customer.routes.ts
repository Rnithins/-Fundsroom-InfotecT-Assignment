import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createCustomerSchema, updateCustomerSchema, createFollowUpSchema } from '../validators/customer.validator.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// View customers: ADMIN, SALES, ACCOUNTS
router.get('/', authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS), CustomerController.getCustomers);
router.get('/:id', authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS), CustomerController.getCustomerById);
router.get('/:id/followups', authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS), CustomerController.getFollowUps);

// Create / edit customers & followups: ADMIN, SALES
router.post('/', authorize(Role.ADMIN, Role.SALES), validateRequest(createCustomerSchema), CustomerController.createCustomer);
router.put('/:id', authorize(Role.ADMIN, Role.SALES), validateRequest(updateCustomerSchema), CustomerController.updateCustomer);
router.post('/:id/followups', authorize(Role.ADMIN, Role.SALES), validateRequest(createFollowUpSchema), CustomerController.addFollowUp);

// Delete customer: ADMIN only
router.delete('/:id', authorize(Role.ADMIN), CustomerController.deleteCustomer);

export default router;
