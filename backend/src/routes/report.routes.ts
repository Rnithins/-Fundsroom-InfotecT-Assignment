import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize(Role.ADMIN, Role.ACCOUNTS));

router.get('/', ReportController.getReports);

export default router;
