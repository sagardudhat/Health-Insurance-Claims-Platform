import { ClaimStatus } from '@/components/shared/StatusBadge';

import { CLAIM_STATUSES } from '../../config/constants';

// Client-side state machine transition map — kept 1:1 in sync with backend
export const ALLOWED_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  [CLAIM_STATUSES.SUBMITTED]: [CLAIM_STATUSES.UNDER_REVIEW],
  [CLAIM_STATUSES.UNDER_REVIEW]: [CLAIM_STATUSES.APPROVED, CLAIM_STATUSES.PARTIALLY_APPROVED, CLAIM_STATUSES.REJECTED, CLAIM_STATUSES.NEEDS_REVISION],
  [CLAIM_STATUSES.NEEDS_REVISION]: [CLAIM_STATUSES.UNDER_REVIEW], // Via provider resubmit form
  [CLAIM_STATUSES.APPROVED]: [CLAIM_STATUSES.PAID],
  [CLAIM_STATUSES.PARTIALLY_APPROVED]: [CLAIM_STATUSES.PAID],
  [CLAIM_STATUSES.REJECTED]: [],
  [CLAIM_STATUSES.PAID]: [],
};

export const getLegalNextStatuses = (currentStatus: ClaimStatus): ClaimStatus[] => {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
};
