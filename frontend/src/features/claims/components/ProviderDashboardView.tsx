'use client';

import React from 'react';
import { useMyClaims, useMyStats } from '@/features/claims/hooks';
import { useAuthStore } from '@/features/auth/store';
import { DashboardStatCards } from './dashboard/DashboardStatCards';
import { DashboardActionBanner } from './dashboard/DashboardActionBanner';
import { RecentClaimsTable } from './dashboard/RecentClaimsTable';

export const ProviderDashboardView = () => {
  const { user } = useAuthStore();
  const { data: responseData, isLoading } = useMyClaims({ page: 1, limit: 5 });
  const { data: stats } = useMyStats();

  const claims = responseData?.data || [];

  const totalCount = stats?.totalCount ?? 0;
  const pendingCount = stats?.pendingCount ?? 0;
  const approvedCount = stats?.approvedCount ?? 0;
  const totalApprovedPayout = stats?.totalApprovedPayout ?? 0;

  return (
    <div className="h-full overflow-y-auto pr-1 space-y-6">
      {/* Provider Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Welcome back, {user?.name || 'Healthcare Provider'}!
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[var(--brand-700)] px-2 py-0.5 rounded border border-blue-100">
              Provider Portal
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track claims status, review insurance reimbursement payouts, and submit new patient
            billing claims.
          </p>
        </div>
      </div>

      <DashboardStatCards
        totalCount={totalCount}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        totalApprovedPayout={totalApprovedPayout}
      />

      <DashboardActionBanner />

      <RecentClaimsTable claims={claims} isLoading={isLoading} />
    </div>
  );
};
