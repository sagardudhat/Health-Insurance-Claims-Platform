import { claimRepository, ClaimRepository } from '../repositories/claim.repository';
import { userRepository, UserRepository } from '../repositories/user.repository';
import { auditLogRepository, AuditLogRepository } from '../repositories/auditLog.repository';
import { Claim } from '../models/Claim.model';
import { AuditLog } from '../models/AuditLog.model';
import { AppError } from '../errors';
import { UserStatus } from '../types';
import { ALLOWED_SEARCH_FIELDS } from '../validators/claim.validators';
import mongoose from 'mongoose';

export class AdminService {
  private claimRepo: ClaimRepository;
  private userRepo: UserRepository;
  private auditRepo: AuditLogRepository;

  constructor() {
    this.claimRepo = claimRepository;
    this.userRepo = userRepository;
    this.auditRepo = auditLogRepository;
  }

  async getDashboardStats(range: string = 'month', fromStr?: string, toStr?: string) {
    // 1. Calculate Date Range Bounds
    const now = new Date();
    let startDate = new Date();

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (range === 'custom' && fromStr && toStr) {
      startDate = new Date(fromStr);
    } else {
      startDate.setMonth(now.getMonth() - 1); // Default 30 days
    }

    const endDate = range === 'custom' && toStr ? new Date(toStr) : now;

    const dateFilter = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    // 2. Aggregation Pipeline: Status Breakdown & Total Financials
    const statusAgg = await Claim.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalClaimed: { $sum: '$totalClaimed' },
          totalApprovedPayout: { $sum: '$coveredAmount' },
        },
      },
    ]);

    const statusCounts: Record<string, number> = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      APPROVED: 0,
      PARTIALLY_APPROVED: 0,
      REJECTED: 0,
      NEEDS_REVISION: 0,
      PAID: 0,
    };

    let grandTotalClaimed = 0;
    let grandTotalPayout = 0;
    let totalClaimsSubmitted = 0;

    statusAgg.forEach((item) => {
      statusCounts[item._id] = item.count;
      totalClaimsSubmitted += item.count;
      grandTotalClaimed += item.totalClaimed || 0;
      grandTotalPayout += item.totalApprovedPayout || 0;
    });

    // 3. Platform-Wide Average Processing Time Pipeline
    const decisionAudits = await AuditLog.find({
      toStatus: { $in: ['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PAID'] },
      timestamp: { $gte: startDate, $lte: endDate },
    });

    let totalDurationMs = 0;
    let decisionCount = 0;

    for (const decision of decisionAudits) {
      const initialAudit = await AuditLog.findOne({
        claimId: decision.claimId,
        toStatus: 'SUBMITTED',
      });
      if (initialAudit) {
        const duration = new Date(decision.timestamp).getTime() - new Date(initialAudit.timestamp).getTime();
        totalDurationMs += Math.max(0, duration);
        decisionCount++;
      }
    }

    const avgProcessingTimeHours =
      decisionCount > 0 ? Number((totalDurationMs / (1000 * 60 * 60 * decisionCount)).toFixed(1)) : 0;

    // 4. Count Flagged Claims
    const flaggedClaimsCount = await Claim.countDocuments({
      ...dateFilter,
      flagged: true,
    });

    return {
      range,
      dateBounds: { from: startDate, to: endDate },
      totalClaimsSubmitted,
      grandTotalClaimed: Number(grandTotalClaimed.toFixed(2)),
      grandTotalPayout: Number(grandTotalPayout.toFixed(2)),
      avgProcessingTimeHours,
      flaggedClaimsCount,
      statusCounts,
      statusBreakdownList: Object.keys(statusCounts).map((status) => ({
        status,
        count: statusCounts[status],
      })),
    };
  }

  async recomputeFraudFlag(claimId: string) {
    const claim = await this.claimRepo.findById(claimId);
    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    const historicalClaims = await this.claimRepo.findByProcedureCode(claim.procedure.code);
    const otherClaims = historicalClaims.filter((c) => c._id.toString() !== claimId);

    let isFlagged = false;
    let flagReason = undefined;

    if (otherClaims.length >= 3) {
      const avgClaimed =
        otherClaims.reduce((sum, c) => sum + c.totalClaimed, 0) / otherClaims.length;

      if (claim.totalClaimed > 3 * avgClaimed) {
        isFlagged = true;
        flagReason = `Claimed amount ($${claim.totalClaimed.toFixed(
          2
        )}) exceeds 3x procedure code historical average ($${avgClaimed.toFixed(2)}).`;
      }
    }

    const updated = await this.claimRepo.updateStatus(claimId, {
      status: claim.status,
      flagged: isFlagged,
      flagReason,
    });

    return updated;
  }

  async unflagClaim(claimId: string, adminUserId: string) {
    const claim = await this.claimRepo.findById(claimId);
    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    const updated = await this.claimRepo.updateStatus(claimId, {
      status: claim.status,
      flagged: false,
      flagReason: undefined,
    });

    await this.auditRepo.writeAudit({
      claimId,
      action: 'CLAIM_UNFLAGGED_BY_ADMIN',
      fromStatus: claim.status,
      toStatus: claim.status,
      performedBy: adminUserId,
      role: 'admin',
      note: 'Fraud flag cleared by administrator after manual review',
    });

    return updated;
  }

  async getFlaggedClaims() {
    return Claim.find({ flagged: true })
      .populate('submittedBy', 'name email role')
      .sort({ createdAt: -1 });
  }

  async getAllUsers(page: number = 1, limit: number = 10, search?: string, searchField?: string) {
    return this.userRepo.findPaginated(page, limit, search, searchField);
  }

  async updateUserStatus(userId: string, status: UserStatus, currentAdminId?: string) {
    if (userId === currentAdminId && status === 'suspended') {
      throw new AppError('You cannot suspend your own admin account.', 400);
    }
    const user = await this.userRepo.updateStatus(userId, status);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async getAllClaims(filters: {
    status?: string;
    procedureCode?: string;
    flaggedOnly?: string;
    page?: number;
    limit?: number;
    search?: string;
    searchField?: string;
  }) {
    const query: Record<string, any> = {};

    // SECURITY: Validate status against known enum — prevents arbitrary string injection
    const VALID_STATUSES = ['SUBMITTED','UNDER_REVIEW','APPROVED','PARTIALLY_APPROVED','REJECTED','NEEDS_REVISION','PAID'];
    if (filters.status && filters.status !== 'ALL' && VALID_STATUSES.includes(filters.status)) {
      query.status = filters.status;
    }

    if (filters.procedureCode) {
      query['procedure.code'] = filters.procedureCode.toUpperCase().trim();
    }

    if (filters.flaggedOnly === 'true') {
      query.flagged = true;
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    // SECURITY: Whitelist searchField before passing to repository
    const safeSearchField = filters.searchField && (ALLOWED_SEARCH_FIELDS as readonly string[]).includes(filters.searchField)
      ? filters.searchField
      : 'all';

    return this.claimRepo.findPaginated(query, page, limit, filters.search, safeSearchField);
  }
}

export const adminService = new AdminService();
