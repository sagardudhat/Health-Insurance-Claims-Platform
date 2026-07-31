import { Request, Response } from 'express';
import { claimService } from '../services/claim.service';
import { catchAsync, buildSuccess } from '../utils';
import { AppError } from '../errors';

export class ClaimController {
  createClaim = catchAsync(async (req: Request, res: Response) => {
    // Parse line items JSON if sent via multipart form-data
    let items = req.body.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (err) {
        throw new AppError('Invalid JSON format for line items', 400);
      }
    }

    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) {
      throw new AppError('At least one supporting document (PDF, PNG, JPG) is mandatory.', 400);
    }

    const result = await claimService.createClaim(
      req.user!.id,
      {
        ...req.body,
        items,
      },
      files
    );

    res.status(201).json(buildSuccess(result, 'Claim submitted successfully'));
  });

  getMyClaims = catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const searchField = req.query.searchField as string;
    const status = req.query.status as string;

    const result = await claimService.getMyClaims(req.user!.id, page, limit, search, searchField, status);
    res.status(200).json(buildSuccess(result, 'Submitted claims fetched'));
  });

  getMyStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await claimService.getProviderStats(req.user!.id);
    res.status(200).json(buildSuccess(stats, 'Provider stats fetched'));
  });

  getClaimById = catchAsync(async (req: Request, res: Response) => {
    const result = await claimService.getClaimById(req.params.id, req.user!.id, req.user!.role);
    res.status(200).json(buildSuccess(result, 'Claim details fetched'));
  });

  downloadDocument = catchAsync(async (req: Request, res: Response) => {
    const { claimId, filename } = req.params;
    const file = await claimService.getDocumentFile(claimId, filename, req.user!.id, req.user!.role);

    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
    res.sendFile(file.filePath);
  });
}

export const claimController = new ClaimController();
