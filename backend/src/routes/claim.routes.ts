import { Router } from 'express';
import { claimController } from '../controllers/claim.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { claimDocumentUpload } from '../middleware/upload';
import { createClaimSchema } from '../validators/claim.validators';

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

// Shared/Protected Routes (Provider owner, Reviewer, or Admin)
router.get('/:id', authorize('provider', 'reviewer', 'admin'), claimController.getClaimById);
router.get(
  '/:claimId/documents/:filename',
  authorize('provider', 'reviewer', 'admin'),
  claimController.downloadDocument
);

export const claimRoutes = router;
