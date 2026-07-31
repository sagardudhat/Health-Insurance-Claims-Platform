'use client';

import React, { useState } from 'react';
import { useAdminDashboardStats } from '@/features/admin/hooks';
import { AdminDashboardHeader } from './dashboard/AdminDashboardHeader';
import { AdminDashboardStats } from './dashboard/AdminDashboardStats';
import { AdminDashboardCharts } from './dashboard/AdminDashboardCharts';

const STATUS_COLOR_MAP: Record<string, string> = {
  SUBMITTED: '#667085',
  UNDER_REVIEW: '#B54708',
  NEEDS_REVISION: '#B93815',
  APPROVED: '#067647',
  PARTIALLY_APPROVED: '#3E7C0A',
  REJECTED: '#B42318',
  PAID: '#175CD3',
};

export const AdminDashboardView = () => {
  const [range, setRange] = useState<string>('month');
  const { data: stats, isLoading } = useAdminDashboardStats({ range });

  const chartData =
    stats?.statusBreakdownList.map((item) => ({
      name: item.status.replace('_', ' '),
      status: item.status,
      Claims: item.count,
      color: STATUS_COLOR_MAP[item.status] || '#667085',
    })) || [];

  return (
    <div className="h-full overflow-y-auto pr-1 space-y-6">
      <AdminDashboardHeader range={range} setRange={setRange} />
      <AdminDashboardStats stats={stats} isLoading={isLoading} />
      <AdminDashboardCharts chartData={chartData} isLoading={isLoading} />
    </div>
  );
};
