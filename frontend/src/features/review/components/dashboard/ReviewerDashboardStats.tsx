import React from 'react';
import { Clock, CheckCircle2, BarChart2 } from 'lucide-react';
import { ReviewerStats as IReviewerStats } from '@/features/review/api';
import { PaginatedResponse } from '@/features/claims/types';
type PaginationData = PaginatedResponse<any>['pagination'];

interface ReviewerDashboardStatsProps {
  stats?: IReviewerStats;
  pagination?: PaginationData;
}

export const ReviewerDashboardStats = ({ stats, pagination }: ReviewerDashboardStatsProps) => {
  return (
    <div className="shrink-0 grid grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        {
          label: 'Pending Review',
          value: stats?.pendingQueueCount ?? pagination?.totalItems ?? '—',
          sub: 'Claims awaiting',
          icon: <Clock className="w-5 h-5 text-amber-500" />,
          color: 'text-amber-600',
        },
        {
          label: 'Reviewed Today',
          value: stats?.claimsReviewedToday ?? '—',
          sub: 'Decisions issued',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          color: 'text-emerald-600',
        },
        {
          label: 'Avg. Processing',
          value:
            stats?.avgProcessingTimeHours != null
              ? `${Number(stats.avgProcessingTimeHours).toFixed(1)}h`
              : '—',
          sub: 'Per claim',
          icon: <BarChart2 className="w-5 h-5 text-[var(--brand-500)]" />,
          color: 'text-[var(--brand-600)]',
        },
      ].map((card) => (
        <div
          key={card.label}
          className="bg-white p-4 rounded-xl border border-[var(--border)] shadow-xs"
        >
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">{card.label}</span>
            {card.icon}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-bold tabular-nums ${card.color}`}>{card.value}</span>
            <span className="text-[10px] text-[var(--text-muted)]">{card.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
