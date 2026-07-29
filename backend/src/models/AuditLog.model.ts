import mongoose, { Schema, Document } from 'mongoose';
import { ClaimStatus, UserRole } from '../types';

export interface IAuditLogDocument extends Document {
  claimId: mongoose.Types.ObjectId;
  action: string;
  fromStatus?: ClaimStatus;
  toStatus: ClaimStatus;
  performedBy: mongoose.Types.ObjectId;
  role: UserRole;
  note?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    claimId: {
      type: Schema.Types.ObjectId,
      ref: 'Claim',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    fromStatus: {
      type: String,
      enum: [
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'PARTIALLY_APPROVED',
        'REJECTED',
        'NEEDS_REVISION',
        'PAID',
      ],
    },
    toStatus: {
      type: String,
      enum: [
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'PARTIALLY_APPROVED',
        'REJECTED',
        'NEEDS_REVISION',
        'PAID',
      ],
      required: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['provider', 'reviewer', 'admin'],
      required: true,
    },
    note: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Prevent updating or deleting audit logs to guarantee immutability
auditLogSchema.pre('updateOne', function () {
  throw new Error('AuditLog documents are immutable and cannot be updated.');
});

auditLogSchema.pre('findOneAndUpdate', function () {
  throw new Error('AuditLog documents are immutable and cannot be updated.');
});

auditLogSchema.pre('deleteOne', function () {
  throw new Error('AuditLog documents are immutable and cannot be deleted.');
});

auditLogSchema.pre('findOneAndDelete', function () {
  throw new Error('AuditLog documents are immutable and cannot be deleted.');
});

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', auditLogSchema);
