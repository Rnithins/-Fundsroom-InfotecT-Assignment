import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createUserSchema, updateUserSchema } from '../validators/user.validator.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.get('/', UserController.getAllUsers);
router.post('/', validateRequest(createUserSchema), UserController.createUser);
router.put('/:id', validateRequest(updateUserSchema), UserController.updateUser);

export default router;
