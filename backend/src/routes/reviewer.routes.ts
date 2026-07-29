import { Router } from 'express';
import { reviewerController } from '../controllers/reviewer.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { claimDocumentUpload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

// Reviewer Dashboard & Queue Routes
router.get('/stats', authorize('reviewer', 'admin'), reviewerController.getStats);
router.get('/queue', authorize('reviewer', 'admin'), reviewerController.getQueue);

// Status Transition Endpoint
router.patch('/claims/:id/status', authorize('reviewer', 'admin'), reviewerController.updateStatus);

// Provider Resubmit Endpoint
router.patch(
  '/claims/:id/resubmit',
  authorize('provider'),
  claimDocumentUpload.array('documents', 5),
  reviewerController.resubmitClaim
);

export const reviewerRoutes = router;
