import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { loginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.me);

export default router;
