import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.get('/', ActivityController.getActivityLogs);

export default router;
