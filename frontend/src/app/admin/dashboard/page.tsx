'use client';

import React, { useState } from 'react';
import { useAdminDashboardStats } from '@/features/admin/hooks';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  DollarSign, 
  Clock, 
  ShieldAlert, 
  Calendar, 
  Loader2, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';

const STATUS_COLOR_MAP: Record<string, string> = {
  SUBMITTED: '#667085',
  UNDER_REVIEW: '#B54708',
  NEEDS_REVISION: '#B93815',
  APPROVED: '#067647',
  PARTIALLY_APPROVED: '#3E7C0A',
  REJECTED: '#B42318',
  PAID: '#175CD3',
};

export default function AdminDashboardPage() {
  const [range, setRange] = useState<string>('month');
  const { data: stats, isLoading } = useAdminDashboardStats({ range });

  const chartData = stats?.statusBreakdownList.map((item) => ({
    name: item.status.replace('_', ' '),
    status: item.status,
    Claims: item.count,
    color: STATUS_COLOR_MAP[item.status] || '#667085',
  })) || [];

  return (
    <div className="h-full overflow-y-auto pr-1 space-y-6">
      {/* Header Banner & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Platform Admin Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Platform-wide claims statistics, financial payout summaries, turnaround times, and fraud detection metrics.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 bg-[var(--bg)] p-1.5 rounded-lg border border-[var(--border)] self-start md:self-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                range === r.id
                  ? 'bg-white text-[var(--brand-700)] shadow-xs border border-[var(--border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Graphical Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart: Status Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--brand-500)]" />
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Claim Status Breakdown
              </h2>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium">Volume</span>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-500)]" />
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E4E7EC',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Claims" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie Chart: Distribution */}
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--brand-500)]" />
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Workflow Distribution
              </h2>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium">Percentage</span>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-500)]" />
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.filter((d) => d.Claims > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="Claims"
                  >
                    {chartData
                      .filter((d) => d.Claims > 0)
                      .map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E4E7EC',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
