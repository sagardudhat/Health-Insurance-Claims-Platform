import { Router } from 'express';
import { reviewerController } from '../controllers/reviewer.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { claimDocumentUpload } from '../middleware/upload';
import { statusTransitionSchema } from '../validators/claim.validators';
import { adminService } from '../services/admin.service';
import { catchAsync, buildSuccess } from '../utils';

const router = Router();

router.use(authenticate);

// ── Dashboard & Queue ──────────────────────────────────────────────────────────
router.get('/stats', authorize('reviewer', 'admin'), reviewerController.getStats);
router.get('/queue', authorize('reviewer', 'admin'), reviewerController.getQueue);

// ── All Claims Directory (Reviewer view — same data as admin audit list) ───────
router.get(
  '/claims',
  authorize('reviewer', 'admin'),
  catchAsync(async (req, res) => {
    const claims = await adminService.getAllClaims({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      search: req.query.search as string,
      searchField: req.query.searchField as string,
      status: req.query.status as string,
      flaggedOnly: req.query.flaggedOnly as string,
    });
    res.status(200).json(buildSuccess(claims, 'All claims fetched'));
  })
);

// ── Status Transition ─────────────────────────────────────────────────────────
// SECURITY: Zod validation runs BEFORE the controller.
// - `toStatus` must be a known enum value (prevents garbage input hitting the state machine)
// - `note` is capped at 2000 chars (prevents large payload injection)
// - `deniedItemIds` must be an array of strings (type safety before DB access)
router.patch(
  '/claims/:id/status',
  authorize('reviewer', 'admin'),
  validate(statusTransitionSchema),
  reviewerController.updateStatus
);

// ── Provider Resubmit ─────────────────────────────────────────────────────────
// SECURITY: Only 'provider' role can access this endpoint — not reviewer or admin
router.patch(
  '/claims/:id/resubmit',
  authorize('provider'),
  claimDocumentUpload.array('documents', 5),
  reviewerController.resubmitClaim
);

export const reviewerRoutes = router;
