import React from 'react';
import { StatusBadge, ClaimStatus } from '@/components/shared/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const allStatuses: ClaimStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'NEEDS_REVISION',
  'APPROVED',
  'PARTIALLY_APPROVED',
  'REJECTED',
  'PAID',
];

export const RootLandingView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Design System & Status Badge Verification
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Scaffold test page verifying token colors, badge contrast, dot indicators, and role shell
          layout.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-[var(--border)] shadow-xs space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Claim Status Badges (Visual Accessibility Test)
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {allStatuses.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
          <StatusBadge status="UNDER_REVIEW" isFlagged={true} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">
            Backend Status
          </p>
          <p className="text-2xl font-bold mt-1 text-[var(--brand-500)]">Layered Arch Ready</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">
            Frontend Router
          </p>
          <p className="text-2xl font-bold mt-1 text-[var(--brand-500)]">Next.js 14 App Router</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">
            State Machine
          </p>
          <p className="text-2xl font-bold mt-1 text-[var(--brand-500)]">Phase 0 Locked</p>
        </div>
      </div>
    </div>
  );
};
