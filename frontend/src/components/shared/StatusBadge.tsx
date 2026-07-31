import React from 'react';
import { CLAIM_STATUSES } from '../../config/constants';

export type ClaimStatus = (typeof CLAIM_STATUSES)[keyof typeof CLAIM_STATUSES];

interface StatusBadgeProps {
  status: ClaimStatus;
  isFlagged?: boolean;
}

const statusConfig: Record<
  ClaimStatus,
  { label: string; bg: string; color: string }
> = {
  [CLAIM_STATUSES.SUBMITTED]: {
    label: 'Submitted',
    bg: 'var(--status-submitted-bg)',
    color: 'var(--status-submitted)',
  },
  [CLAIM_STATUSES.UNDER_REVIEW]: {
    label: 'Under Review',
    bg: 'var(--status-review-bg)',
    color: 'var(--status-review)',
  },
  [CLAIM_STATUSES.NEEDS_REVISION]: {
    label: 'Needs Revision',
    bg: 'var(--status-revision-bg)',
    color: 'var(--status-revision)',
  },
  [CLAIM_STATUSES.APPROVED]: {
    label: 'Approved',
    bg: 'var(--status-approved-bg)',
    color: 'var(--status-approved)',
  },
  [CLAIM_STATUSES.PARTIALLY_APPROVED]: {
    label: 'Partially Approved',
    bg: 'var(--status-partial-bg)',
    color: 'var(--status-partial)',
  },
  [CLAIM_STATUSES.REJECTED]: {
    label: 'Rejected',
    bg: 'var(--status-rejected-bg)',
    color: 'var(--status-rejected)',
  },
  [CLAIM_STATUSES.PAID]: {
    label: 'Paid',
    bg: 'var(--status-paid-bg)',
    color: 'var(--status-paid)',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isFlagged }) => {
  const config = statusConfig[status] || statusConfig[CLAIM_STATUSES.SUBMITTED];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: `${config.color}30`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: config.color }}
      />
      <span>{config.label}</span>
      {isFlagged && (
        <span
          className="ml-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-1 rounded"
          title="Flagged for Fraud Audit"
        >
          FLAGGED
        </span>
      )}
    </span>
  );
};
