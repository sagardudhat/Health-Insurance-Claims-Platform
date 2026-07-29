import { claimRepository, ClaimRepository } from '../repositories/claim.repository';
import { auditLogRepository, AuditLogRepository } from '../repositories/auditLog.repository';
import { coverageService, CoverageService } from './coverage.service';
import { AppError } from '../errors';
import { ClaimStatus, UserRole } from '../types';
import fs from 'fs';
import path from 'path';

// Allowed State Machine Transitions Map
export const ALLOWED_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'NEEDS_REVISION'],
  NEEDS_REVISION: ['UNDER_REVIEW'], // Only via resubmit endpoint
  APPROVED: ['PAID'],
  PARTIALLY_APPROVED: ['PAID'],
  REJECTED: [], // Terminal state
  PAID: [],     // Terminal state
};

export class ClaimService {
  private claimRepo: ClaimRepository;
  private auditRepo: AuditLogRepository;
  private coverageServ: CoverageService;

  constructor() {
    this.claimRepo = claimRepository;
    this.auditRepo = auditLogRepository;
    this.coverageServ = coverageService;
  }

  async createClaim(
    userId: string,
    data: {
      patientName: string;
      policyNumber: string;
      patientDob: string;
      procedureName: string;
      procedureCode: string;
      dateOfService: string;
      items: Array<{ description: string; quantity: number; unitCost: number }>;
    },
    files: Express.Multer.File[] = []
  ) {
    const totalClaimed = data.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

    const documents = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    }));

    const claim = await this.claimRepo.create({
      patient: {
        name: data.patientName,
        policyNumber: data.policyNumber,
        dob: new Date(data.patientDob),
      },
      procedure: {
        name: data.procedureName,
        code: data.procedureCode.toUpperCase().trim(),
        dateOfService: new Date(data.dateOfService),
      },
      items: data.items,
      totalClaimed,
      documents,
      status: 'SUBMITTED',
      submittedBy: userId as any,
      coveredAmount: 0,
      patientResponsibility: totalClaimed,
      flagged: false,
    });

    await this.auditRepo.writeAudit({
      claimId: claim._id.toString(),
      action: 'CLAIM_SUBMITTED',
      toStatus: 'SUBMITTED',
      performedBy: userId,
      role: 'provider',
      note: 'Initial claim submission with itemized charges',
    });

    await this.evaluateFraudFlag(claim._id.toString());

    return this.getClaimById(claim._id.toString(), userId, 'provider');
  }

  async getMyClaims(userId: string, page: number = 1, limit: number = 10, search?: string) {
    return this.claimRepo.findPaginated({ submittedBy: userId }, page, limit, search);
  }

  async getReviewerQueue(page: number = 1, limit: number = 10, search?: string) {
    return this.claimRepo.findPaginated(
      { status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      page,
      limit,
      search
    );
  }

  async getClaimById(claimId: string, userId: string, role: UserRole) {
    const claim = await this.claimRepo.findById(claimId);
    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    if (role === 'provider' && claim.submittedBy._id.toString() !== userId) {
      throw new AppError('Forbidden: You do not have permission to view this claim', 403);
    }

    const auditTrail = await this.auditRepo.findByClaimId(claimId);

    return {
      claim,
      auditTrail,
    };
  }

  async transitionStatus(
    claimId: string,
    toStatus: ClaimStatus,
    note: string | undefined,
    deniedItemIds: string[] = [],
    reviewerUserId: string,
    role: UserRole = 'reviewer'
  ) {
    const claim = await this.claimRepo.findById(claimId);
    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    const fromStatus = claim.status;

    // 1. Enforce State Machine Transition Map (409 Conflict on illegal moves)
    const allowedNext = ALLOWED_TRANSITIONS[fromStatus] || [];
    if (!allowedNext.includes(toStatus)) {
      throw new AppError(
        `Illegal status transition from '${fromStatus}' to '${toStatus}'. Allowed transitions: [${allowedNext.join(
          ', '
        )}]`,
        409
      );
    }

    // 2. Validate revision requirement
    if (toStatus === 'NEEDS_REVISION' && (!note || note.trim().length === 0)) {
      throw new AppError('Reviewer note explaining required revisions is mandatory', 400);
    }

    let coveredAmount = claim.coveredAmount;
    let patientResponsibility = claim.patientResponsibility;
    let updatedItems = claim.items;

    // 3. Handle status-specific logic & Coverage Calculations
    if (toStatus === 'APPROVED' || toStatus === 'PARTIALLY_APPROVED') {
      const calcResult = await this.coverageServ.calculateCoverageForClaim(claim, deniedItemIds);
      coveredAmount = Number(calcResult.coveredAmount) || 0;
      patientResponsibility = Number(calcResult.patientResponsibility) || 0;

      // Update line items denied status
      const safeDeniedIds = (deniedItemIds || []).map((id) => id.toString());
      updatedItems = claim.items.map((item: any) => {
        const raw = typeof item.toObject === 'function' ? item.toObject() : item;
        const itemId = raw._id ? raw._id.toString() : '';
        return {
          ...raw,
          isDenied: safeDeniedIds.includes(itemId),
        };
      }) as any;
    } else if (toStatus === 'REJECTED') {
      coveredAmount = 0;
      patientResponsibility = claim.totalClaimed;
      updatedItems = claim.items.map((item: any) => {
        const raw = typeof item.toObject === 'function' ? item.toObject() : item;
        return {
          ...raw,
          isDenied: true,
        };
      }) as any;
    }

    // 4. Update Claim in Database
    const updatedClaim = await this.claimRepo.updateStatus(claimId, {
      status: toStatus,
      coveredAmount,
      patientResponsibility,
      reviewerNotes: note || claim.reviewerNotes,
      items: updatedItems,
    });

    // 5. Write Immutable AuditLog entry
    await this.auditRepo.writeAudit({
      claimId,
      action: `STATUS_CHANGED_TO_${toStatus}`,
      fromStatus,
      toStatus,
      performedBy: reviewerUserId,
      role,
      note: note || `Status transitioned to ${toStatus}`,
    });

    return this.getClaimById(claimId, reviewerUserId, role);
  }

  async resubmitClaim(
    claimId: string,
    userId: string,
    data: {
      patientName?: string;
      policyNumber?: string;
      patientDob?: string;
      procedureName?: string;
      procedureCode?: string;
      dateOfService?: string;
      items?: Array<{ description: string; quantity: number; unitCost: number }>;
    },
    files: Express.Multer.File[] = []
  ) {
    const claim = await this.claimRepo.findById(claimId);
    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    if (claim.submittedBy._id.toString() !== userId) {
      throw new AppError('Forbidden: Only claim owner can resubmit', 403);
    }

    if (claim.status !== 'NEEDS_REVISION') {
      throw new AppError(
        `Claim cannot be resubmitted. Current status is '${claim.status}', but must be 'NEEDS_REVISION'`,
        409
      );
    }

    let items = claim.items;
    let totalClaimed = claim.totalClaimed;

    if (data.items && data.items.length > 0) {
      items = data.items.map((item) => ({
        ...item,
        isDenied: false,
      })) as any;
      totalClaimed = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    }

    let documents = claim.documents;
    if (files.length > 0) {
      const newDocs = files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      }));
      documents = [...documents, ...newDocs] as any;
    }

    // Update claim and transition back to UNDER_REVIEW
    await this.claimRepo.updateClaimData(claimId, {
      patient: {
        name: data.patientName || claim.patient.name,
        policyNumber: data.policyNumber || claim.patient.policyNumber,
        dob: data.patientDob ? new Date(data.patientDob) : claim.patient.dob,
      },
      procedure: {
        name: data.procedureName || claim.procedure.name,
        code: data.procedureCode ? data.procedureCode.toUpperCase().trim() : claim.procedure.code,
        dateOfService: data.dateOfService ? new Date(data.dateOfService) : claim.procedure.dateOfService,
      },
      items,
      totalClaimed,
      documents,
      status: 'UNDER_REVIEW',
      coveredAmount: 0,
      patientResponsibility: totalClaimed,
    });

    // Write audit log entry for resubmission
    await this.auditRepo.writeAudit({
      claimId,
      action: 'CLAIM_RESUBMITTED',
      fromStatus: 'NEEDS_REVISION',
      toStatus: 'UNDER_REVIEW',
      performedBy: userId,
      role: 'provider',
      note: 'Provider submitted revised claim details and documents',
    });

    return this.getClaimById(claimId, userId, 'provider');
  }

  async getReviewerStats(reviewerUserId: string) {
    const queue = await this.claimRepo.findQueue();
    const pendingQueueCount = queue.length;

    // Claims reviewed today by this reviewer
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { AuditLog } = await import('../models/AuditLog.model');
    const mongoose = await import('mongoose');

    const reviewerTodayAudits = await AuditLog.find({
      performedBy: new mongoose.Types.ObjectId(reviewerUserId),
      toStatus: { $in: ['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'NEEDS_REVISION', 'PAID'] },
      timestamp: { $gte: startOfToday },
    });

    // Count unique claims reviewed today
    const uniqueClaimIdsToday = new Set(reviewerTodayAudits.map((a) => a.claimId.toString()));
    const claimsReviewedToday = uniqueClaimIdsToday.size;

    // Calculate average processing time (initial SUBMITTED audit -> final decision audit)
    const allDecisions = await AuditLog.find({
      toStatus: { $in: ['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PAID'] },
    });

    let totalDurationMs = 0;
    let count = 0;

    for (const decision of allDecisions) {
      const initialAudit = await AuditLog.findOne({
        claimId: decision.claimId,
        toStatus: 'SUBMITTED',
      });
      if (initialAudit) {
        const duration = new Date(decision.timestamp).getTime() - new Date(initialAudit.timestamp).getTime();
        totalDurationMs += Math.max(0, duration);
        count++;
      }
    }

    const avgProcessingTimeHours = count > 0 ? Number((totalDurationMs / (1000 * 60 * 60 * count)).toFixed(1)) : 0;

    return {
      pendingQueueCount,
      claimsReviewedToday,
      avgProcessingTimeHours,
    };
  }

  async getDocumentFile(claimId: string, filename: string, userId: string, role: UserRole) {
    const claim = await this.claimRepo.findById(claimId);
    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    if (role === 'provider' && claim.submittedBy._id.toString() !== userId) {
      throw new AppError('Forbidden: You do not have permission to download this document', 403);
    }

    const doc = claim.documents.find((d) => d.filename === filename);
    if (!doc) {
      throw new AppError('Document not found', 404);
    }

    if (!fs.existsSync(doc.path)) {
      throw new AppError('Document file missing from server storage', 404);
    }

    return {
      filePath: doc.path,
      mimetype: doc.mimetype,
      originalName: doc.originalName,
    };
  }

  private async evaluateFraudFlag(claimId: string) {
    const claim = await this.claimRepo.findById(claimId);
    if (!claim) return;

    const historicalClaims = await this.claimRepo.findByProcedureCode(claim.procedure.code);
    const otherClaims = historicalClaims.filter((c) => c._id.toString() !== claimId);

    if (otherClaims.length >= 3) {
      const avgClaimed =
        otherClaims.reduce((sum, c) => sum + c.totalClaimed, 0) / otherClaims.length;

      if (claim.totalClaimed > 3 * avgClaimed) {
        await this.claimRepo.updateStatus(claimId, {
          status: claim.status,
          flagged: true,
          flagReason: `Claimed amount ($${claim.totalClaimed.toFixed(
            2
          )}) exceeds 3x procedure code historical average ($${avgClaimed.toFixed(2)}).`,
        });
      }
    }
  }
}

export const claimService = new ClaimService();
