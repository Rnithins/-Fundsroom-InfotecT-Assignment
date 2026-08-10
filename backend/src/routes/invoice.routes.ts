import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { updateInvoiceStatusSchema } from '../validators/invoice.validator.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// View invoices: ADMIN, ACCOUNTS
router.get('/', authorize(Role.ADMIN, Role.ACCOUNTS), InvoiceController.getInvoices);
router.get('/:id', authorize(Role.ADMIN, Role.ACCOUNTS), InvoiceController.getInvoiceById);
router.get('/:id/print', authorize(Role.ADMIN, Role.ACCOUNTS), InvoiceController.printInvoice);

// Update status: ADMIN, ACCOUNTS
router.put('/:id/status', authorize(Role.ADMIN, Role.ACCOUNTS), validateRequest(updateInvoiceStatusSchema), InvoiceController.updateInvoiceStatus);

export default router;
