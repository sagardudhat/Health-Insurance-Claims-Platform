'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useReviewerQueue, useReviewerStats } from '@/features/review/hooks';
import { useAuthStore } from '@/features/auth/store';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/skeleton';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  BarChart2,
  Activity,
  Search,
} from 'lucide-react';

export default function ReviewerDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pageParam = Number(searchParams.get('page')) || 1;
  const limitParam = Number(searchParams.get('limit')) || 10;
  const searchParam = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(searchParam);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  const { data: responseData, isLoading } = useReviewerQueue({
    page: pageParam,
    limit: limitParam,
    search: searchParam,
  });
  const { data: stats } = useReviewerStats();

  const queue = responseData?.data || [];
  const pagination = responseData?.pagination;

  const updateQueryParams = (newParams: Record<string, string | number | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === '' || val === null) {
        current.delete(key);
      } else {
        current.set(key, String(val));
      }
    });
    const query = current.toString();
    router.push(`${pathname}${query ? `?${query}` : ''}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ search: searchInput.trim(), page: 1 });
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-5 overflow-hidden">

      {/* Welcome Header */}
      <div className="shrink-0 bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Welcome, {user?.name || 'Reviewer'}
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
            Reviewer Portal
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Review pending insurance claims below. Use <Link href="/reviewer/claims" className="text-[var(--brand-500)] font-semibold hover:underline">All Claims</Link> to browse the full directory.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            value: stats?.avgProcessingTimeHours != null
              ? `${Number(stats.avgProcessingTimeHours).toFixed(1)}h`
              : '—',
            sub: 'Per claim',
            icon: <BarChart2 className="w-5 h-5 text-[var(--brand-500)]" />,
            color: 'text-[var(--brand-600)]',
          },
          {
            label: 'Rules Engine',
            value: 'Active',
            sub: 'Auto-coverage calc',
            icon: <Activity className="w-5 h-5 text-[var(--brand-500)]" />,
            color: 'text-emerald-600',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white p-4 rounded-xl border border-[var(--border)] shadow-xs">
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

      {/* Pending Claims Table — full paginated */}
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Table Header + Search */}
        <div className="shrink-0 p-4 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[var(--brand-500)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Pending Review Queue</h2>
            {pagination && (
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-2 py-0.5 rounded-full">
                {pagination.totalItems} pending
              </span>
            )}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search patient, policy..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white w-48"
              />
            </div>
            <Button type="submit" size="sm" variant="outline" className="text-xs">Search</Button>
            {searchParam && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => { setSearchInput(''); updateQueryParams({ search: undefined, page: 1 }); }}
                className="text-xs text-gray-500"
              >
                Clear
              </Button>
            )}
          </form>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : queue.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="font-semibold text-sm text-[var(--text-primary)]">Queue is clear!</p>
            <p className="text-xs text-[var(--text-muted)]">No pending claims require review right now.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
              <table className="w-full text-left text-sm border-collapse min-w-[650px]">
                <thead className="sticky top-0 z-10 bg-gray-50 text-[var(--text-secondary)] text-xs uppercase font-semibold border-b border-[var(--border)] shadow-xs">
                  <tr>
                    <th className="py-3 px-4">Claim ID</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Policy No.</th>
                    <th className="py-3 px-4">Procedure</th>
                    <th className="py-3 px-4">Claimed</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {queue.map((claim) => (
                    <tr key={claim._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[var(--brand-700)]">
                        <div className="flex items-center gap-1.5">
                          {claim.flagged && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                          <span>#{claim._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">{claim.patient.name}</td>
                      <td className="py-3 px-4 text-xs font-mono text-[var(--text-secondary)]">{claim.patient.policyNumber}</td>
                      <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">{claim.procedure.name}</td>
                      <td className="py-3 px-4 font-bold tabular-nums text-[var(--text-primary)]">
                        ${claim.totalClaimed.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={claim.status} isFlagged={claim.flagged} />
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/reviewer/claims/${claim._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-500)] hover:underline"
                        >
                          <span>Review →</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && (
              <Pagination
                pagination={pagination}
                onPageChange={(page) => updateQueryParams({ page })}
                onLimitChange={(limit) => updateQueryParams({ limit, page: 1 })}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
