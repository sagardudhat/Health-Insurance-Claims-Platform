import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { configService } from '../services/config.service';
import { catchAsync, buildSuccess, buildError } from '../utils';

export class AdminController {
  getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const { range, from, to } = req.query;
    const stats = await adminService.getDashboardStats(
      range as string,
      from as string,
      to as string
    );
    res.status(200).json(buildSuccess(stats, 'Admin dashboard statistics fetched'));
  });

  recomputeFraudFlag = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await adminService.recomputeFraudFlag(id);
    res.status(200).json(buildSuccess(result, 'Fraud flag recomputed for claim'));
  });

  unflagClaim = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await adminService.unflagClaim(id, req.user!.id);
    res.status(200).json(buildSuccess(result, 'Fraud flag successfully cleared by admin'));
  });

  getFlaggedClaims = catchAsync(async (req: Request, res: Response) => {
    const claims = await adminService.getFlaggedClaims();
    res.status(200).json(buildSuccess(claims, 'Flagged claims fetched'));
  });

  getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const searchField = req.query.searchField as string;

    const users = await adminService.getAllUsers(page, limit, search, searchField);
    res.status(200).json(buildSuccess(users, 'All platform users fetched'));
  });

  updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = await adminService.updateUserStatus(id, status, req.user!.id);
    res.status(200).json(buildSuccess(user, `User status updated to ${status}`));
  });

  getAllClaims = catchAsync(async (req: Request, res: Response) => {
    const { status, procedureCode, flaggedOnly, page, limit, search, searchField } = req.query;
    const claims = await adminService.getAllClaims({
      status: status as string,
      procedureCode: procedureCode as string,
      flaggedOnly: flaggedOnly as string,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search as string,
      searchField: searchField as string,
    });
    res.status(200).json(buildSuccess(claims, 'Platform claims audit list fetched'));
  });

  getPolicyConfig = catchAsync(async (req: Request, res: Response) => {
    const year = Number(req.query.year) || new Date().getFullYear();
    const config = await configService.getConfigForYear(year);
    res.status(200).json(buildSuccess(config, `Policy config fetched for year ${year}`));
  });

  updatePolicyConfig = catchAsync(async (req: Request, res: Response) => {
    const year = Number(req.body.year) || new Date().getFullYear();
    const annualLimit = Number(req.body.annualLimit);
    const deductible = Number(req.body.deductible);
    const coverageRate = Number(req.body.coverageRate);
    const isActive = Boolean(req.body.isActive ?? true);

    if (isNaN(annualLimit) || annualLimit < 0) {
      return res.status(400).json(buildError('Annual limit must be a positive number'));
    }
    if (isNaN(deductible) || deductible < 0) {
      return res.status(400).json(buildError('Deductible must be a positive number'));
    }
    if (isNaN(coverageRate) || coverageRate < 0 || coverageRate > 1) {
      return res.status(400).json(buildError('Coverage rate must be between 0 and 1'));
    }
    if (deductible > annualLimit) {
      return res.status(400).json(buildError('Deductible cannot be greater than the annual limit'));
    }

    const config = await configService.upsertConfig(year, {
      annualLimit,
      deductible,
      coverageRate,
      isActive,
    });
    res.status(200).json(buildSuccess(config, `Policy config updated for year ${year}`));
  });
}

export const adminController = new AdminController();
