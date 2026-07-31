import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { catchAsync, buildSuccess } from '../utils';

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
}

export const adminController = new AdminController();
