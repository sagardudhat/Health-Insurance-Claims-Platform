import mongoose, { Schema, Document } from 'mongoose';
import { ClaimStatus } from '../types';

export interface ILineItem {
  _id?: string;
  description: string;
  quantity: number;
  unitCost: number;
  isDenied?: boolean;
}

export interface IDocument {
  _id?: string;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  uploadedAt: Date;
}

export interface IClaimDocument extends Document {
  patient: {
    name: string;
    policyNumber: string;
    dob: Date;
  };
  procedure: {
    name: string;
    code: string;
    dateOfService: Date;
  };
  items: ILineItem[];
  totalClaimed: number;
  documents: IDocument[];
  status: ClaimStatus;
  submittedBy: mongoose.Types.ObjectId;
  coveredAmount: number;
  patientResponsibility: number;
  flagged: boolean;
  flagReason?: string;
  reviewerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const lineItemSchema = new Schema<ILineItem>({
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, required: true, min: 0 },
  isDenied: { type: Boolean, default: false },
});

const documentSchema = new Schema<IDocument>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const claimSchema = new Schema<IClaimDocument>(
  {
    patient: {
      name: { type: String, required: true, trim: true },
      policyNumber: { type: String, required: true, trim: true, index: true },
      dob: { type: Date, required: true },
    },
    procedure: {
      name: { type: String, required: true, trim: true },
      code: { type: String, required: true, trim: true, index: true },
      dateOfService: { type: Date, required: true },
    },
    items: {
      type: [lineItemSchema],
      validate: [(val: ILineItem[]) => val.length > 0, 'At least one line item is required'],
    },
    totalClaimed: {
      type: Number,
      required: true,
      min: 0,
    },
    documents: [documentSchema],
    status: {
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
      default: 'SUBMITTED',
      index: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coveredAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    patientResponsibility: {
      type: Number,
      default: 0,
      min: 0,
    },
    flagged: {
      type: Boolean,
      default: false,
      index: true,
    },
    flagReason: { type: String },
    reviewerNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance on queue queries and audit searches
claimSchema.index({ createdAt: -1 });
claimSchema.index({ 'patient.policyNumber': 1, createdAt: -1 });
claimSchema.index({ 'procedure.code': 1 });

export const Claim = mongoose.model<IClaimDocument>('Claim', claimSchema);
