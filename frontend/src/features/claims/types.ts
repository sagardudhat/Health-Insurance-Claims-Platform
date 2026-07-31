import { ClaimStatus } from '@/components/shared/StatusBadge';

export interface LineItem {
  _id?: string;
  description: string;
  quantity: number;
  unitCost: number;
  isDenied?: boolean;
}

export interface ClaimDocument {
  _id: string;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

export interface AuditLogEntry {
  _id: string;
  claimId: string;
  action: string;
  fromStatus?: ClaimStatus;
  toStatus: ClaimStatus;
  performedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  role: string;
  note?: string;
  timestamp: string;
}

export interface Claim {
  _id: string;
  patient: {
    name: string;
    policyNumber: string;
    dob: string;
  };
  procedure: {
    name: string;
    code: string;
    dateOfService: string;
  };
  items: LineItem[];
  documents: ClaimDocument[];
  submittedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  totalClaimed: number;
  coveredAmount: number;
  patientResponsibility: number;
  deductibleApplied?: number;
  status: ClaimStatus;
  flagged?: boolean;
  flagReason?: string;
  reviewerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimDetailsResponse {
  claim: Claim;
  auditTrail: AuditLogEntry[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
