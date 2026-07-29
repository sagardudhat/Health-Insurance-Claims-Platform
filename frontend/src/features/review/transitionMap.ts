import { ClaimStatus } from '@/components/shared/StatusBadge';

// Client-side state machine transition map — kept 1:1 in sync with backend
export const ALLOWED_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'NEEDS_REVISION'],
  NEEDS_REVISION: ['UNDER_REVIEW'], // Via provider resubmit form
  APPROVED: ['PAID'],
  PARTIALLY_APPROVED: ['PAID'],
  REJECTED: [],
  PAID: [],
};

export const getLegalNextStatuses = (currentStatus: ClaimStatus): ClaimStatus[] => {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
};
