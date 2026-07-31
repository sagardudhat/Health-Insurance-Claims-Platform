import React from 'react';
import { FileText, Clock, CheckCircle2, DollarSign } from 'lucide-react';

interface DashboardStatCardsProps {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  totalApprovedPayout: number;
}

export const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({
  totalCount,
  pendingCount,
  approvedCount,
  totalApprovedPayout,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
        <div className="flex items-center justify-between text-[var(--text-muted)]">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Claims</span>
          <FileText className="w-5 h-5 text-[var(--brand-500)]" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
            {totalCount}
          </span>
          <span className="text-xs text-[var(--text-secondary)] font-medium">Submitted</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
        <div className="flex items-center justify-between text-[var(--text-muted)]">
          <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
          <Clock className="w-5 h-5 text-amber-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
            {pendingCount}
          </span>
          <span className="text-xs text-amber-600 font-medium">In Queue</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
        <div className="flex items-center justify-between text-[var(--text-muted)]">
          <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
            {approvedCount}
          </span>
          <span className="text-xs text-emerald-600 font-medium">Resolved</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
        <div className="flex items-center justify-between text-[var(--text-muted)]">
          <span className="text-xs font-semibold uppercase tracking-wider">Reimbursement</span>
          <DollarSign className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            ${totalApprovedPayout.toFixed(2)}
          </span>
          <span className="text-xs text-emerald-600 font-medium">Payouts</span>
        </div>
      </div>
    </div>
  );
};
