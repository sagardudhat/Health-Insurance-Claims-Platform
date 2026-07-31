import { Router } from 'express';
import { claimController } from '../controllers/claim.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { claimDocumentUpload } from '../middleware/upload';

const router = Router();

// All claim routes require authentication
router.use(authenticate);

// Provider Routes
router.post(
  '/',
  authorize('provider'),
  claimDocumentUpload.array('documents', 5),
  claimController.createClaim
);

router.get('/mine', authorize('provider'), claimController.getMyClaims);
router.get('/mine/stats', authorize('provider'), claimController.getMyStats);

// Shared/Protected Routes (Provider owner, Reviewer, or Admin)
router.get('/:id', authorize('provider', 'reviewer', 'admin'), claimController.getClaimById);
router.get(
  '/:claimId/documents/:filename',
  authorize('provider', 'reviewer', 'admin'),
  claimController.downloadDocument
);

export const claimRoutes = router;
