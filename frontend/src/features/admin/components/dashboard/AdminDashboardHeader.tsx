import React from 'react';

interface AdminDashboardHeaderProps {
  range: string;
  setRange: (range: string) => void;
}

export const AdminDashboardHeader = ({ range, setRange }: AdminDashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Platform Admin Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Platform-wide claims statistics, financial payout summaries, turnaround times, and fraud
          detection metrics.
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
  );
};
