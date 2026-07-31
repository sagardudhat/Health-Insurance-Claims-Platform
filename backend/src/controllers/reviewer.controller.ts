import { Request, Response } from 'express';
import { claimService } from '../services/claim.service';
import { catchAsync, buildSuccess } from '../utils';

export class ReviewerController {
  getQueue = catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const searchField = req.query.searchField as string;

    const queue = await claimService.getReviewerQueue(page, limit, search, searchField);
    res.status(200).json(buildSuccess(queue, 'Review queue claims fetched'));
  });

  getStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await claimService.getReviewerStats(req.user!.id);
    res.status(200).json(buildSuccess(stats, 'Reviewer dashboard stats fetched'));
  });

  updateStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { toStatus, note, deniedItemIds } = req.body;

    const result = await claimService.transitionStatus(
      id,
      toStatus,
      note,
      deniedItemIds,
      req.user!.id,
      req.user!.role
    );

    res.status(200).json(buildSuccess(result, `Claim status successfully updated to ${toStatus}`));
  });

  resubmitClaim = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    let items = req.body.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (err) {}
    }
    const files = (req.files as Express.Multer.File[]) || [];

    const result = await claimService.resubmitClaim(
      id,
      req.user!.id,
      {
        ...req.body,
        items,
      },
      files
    );

    res.status(200).json(buildSuccess(result, 'Claim resubmitted for review'));
  });
}

export const reviewerController = new ReviewerController();
