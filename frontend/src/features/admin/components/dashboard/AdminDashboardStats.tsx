import React from 'react';
import { Activity, DollarSign, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AdminDashboardStats as IAdminDashboardStats } from '@/features/admin/api';

interface AdminDashboardStatsProps {
  stats?: IAdminDashboardStats;
  isLoading: boolean;
}

export const AdminDashboardStats = ({ stats, isLoading }: AdminDashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
        <div className="flex items-center justify-between text-[var(--text-muted)]">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Submitted</span>
          <Activity className="w-5 h-5 text-[var(--brand-500)]" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
            {isLoading ? '...' : stats?.totalClaimsSubmitted || 0}
          </span>
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
            Claims
          </span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
        <div className="flex items-center justify-between text-[var(--text-muted)]">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Claimed</span>
          <DollarSign className="w-5 h-5 text-gray-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {isLoading ? '...' : `$${(stats?.grandTotalClaimed || 0).toLocaleString()}`}
          </span>
          <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            Billed
          </span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
        <div className="flex items-center justify-between text-[var(--text-muted)]">
          <span className="text-xs font-semibold uppercase tracking-wider">Approved Payout</span>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-700 tabular-nums">
            {isLoading ? '...' : `$${(stats?.grandTotalPayout || 0).toLocaleString()}`}
          </span>
          <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
            Disbursed
          </span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
        <div className="flex items-center justify-between text-[var(--text-muted)]">
          <span className="text-xs font-semibold uppercase tracking-wider">Flagged Suspicious</span>
          <ShieldAlert className="w-5 h-5 text-red-600" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-3xl font-bold text-red-600 tabular-nums">
            {isLoading ? '...' : stats?.flaggedClaimsCount || 0}
          </span>
          <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded">
            Fraud Flag
          </span>
        </div>
      </div>
    </div>
  );
};
