import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { loginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/login', (req, res) => {
  res.status(405).json({
    success: false,
    message: 'The /api/auth/login endpoint requires an HTTP POST request with JSON body: { email, password }.',
    docs: '/api/docs',
  });
});
router.get('/me', authenticate, AuthController.me);


export default router;
