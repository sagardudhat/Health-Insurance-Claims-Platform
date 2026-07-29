import { AuditLog, IAuditLogDocument } from '../models/AuditLog.model';
import { ClaimStatus, UserRole } from '../types';
import mongoose from 'mongoose';

export class AuditLogRepository {
  async writeAudit(data: {
    claimId: string | mongoose.Types.ObjectId;
    action: string;
    fromStatus?: ClaimStatus;
    toStatus: ClaimStatus;
    performedBy: string | mongoose.Types.ObjectId;
    role: UserRole;
    note?: string;
  }): Promise<IAuditLogDocument> {
    const audit = new AuditLog({
      ...data,
      timestamp: new Date(),
    });
    return audit.save();
  }

  async findByClaimId(claimId: string): Promise<IAuditLogDocument[]> {
    return AuditLog.find({ claimId })
      .populate('performedBy', 'name email role')
      .sort({ timestamp: 1 });
  }
}

export const auditLogRepository = new AuditLogRepository();
