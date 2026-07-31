import { Router, Request, Response } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators/auth.validators';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { buildSuccess } from '../utils';

const router = Router();

// Public auth routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected profile route
router.get('/me', authenticate, authController.getMe);

// Role-Based Access Control (RBAC) Verification Routes
router.get(
  '/test-provider',
  authenticate,
  authorize('provider', 'admin'),
  (req: Request, res: Response) => {
    res.json(buildSuccess({ message: 'Access granted to Provider route', user: req.user }));
  }
);

router.get(
  '/test-reviewer',
  authenticate,
  authorize('reviewer', 'admin'),
  (req: Request, res: Response) => {
    res.json(buildSuccess({ message: 'Access granted to Reviewer route', user: req.user }));
  }
);

router.get('/test-admin', authenticate, authorize('admin'), (req: Request, res: Response) => {
  res.json(buildSuccess({ message: 'Access granted to Admin route', user: req.user }));
});

export const authRoutes = router;
