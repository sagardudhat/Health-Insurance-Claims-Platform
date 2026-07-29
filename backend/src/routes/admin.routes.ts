import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All admin routes strictly require admin role
router.use(authenticate, authorize('admin'));

// Analytics & Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Fraud Flagging
router.post('/claims/:id/recompute-flag', adminController.recomputeFraudFlag);
router.patch('/claims/:id/unflag', adminController.unflagClaim);
router.get('/claims/flagged', adminController.getFlaggedClaims);

// User Account Management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);

// Platform-Wide Audit Claims List
router.get('/claims', adminController.getAllClaims);

export const adminRoutes = router;
