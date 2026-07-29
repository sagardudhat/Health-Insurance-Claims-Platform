'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useReviewerQueue, useReviewerStats } from '@/features/review/hooks';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatusTransitionModal } from '@/components/shared/StatusTransitionModal';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { StatCardsSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { Claim } from '@/features/claims/types';
import { 
  CheckSquare, 
  Clock, 
  CheckCircle, 
  FileText, 
  AlertTriangle, 
  ArrowRight,
  ShieldAlert,
  Search
} from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewerDashboardPage() {
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

  const { data: responseData, isLoading: isQueueLoading } = useReviewerQueue({
    page: pageParam,
    limit: limitParam,
    search: searchParam,
  });

  const { data: stats, isLoading: isStatsLoading } = useReviewerStats();

  const queue = responseData?.data || [];
  const pagination = responseData?.pagination;

  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleOpenReviewModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 overflow-hidden">
      {/* Header Banner */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Claims Review Queue</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Assess incoming provider claims, execute automated coverage calculations, and record decision audit logs.
        </p>
      </div>

      {/* 3 Stat Cards */}
      {isStatsLoading ? (
        <div className="shrink-0">
          <StatCardsSkeleton count={3} />
        </div>
      ) : (
        <div className="shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[var(--border)] shadow-xs">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Queue</span>
              <CheckSquare className="w-5 h-5 text-[var(--status-review)]" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                {stats?.pendingQueueCount || 0}
              </span>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Needs Action
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[var(--border)] shadow-xs">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="text-xs font-semibold uppercase tracking-wider">Reviewed Today</span>
              <CheckCircle className="w-5 h-5 text-[var(--status-approved)]" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                {stats?.claimsReviewedToday || 0}
              </span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Completed
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[var(--border)] shadow-xs">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Processing Time</span>
              <Clock className="w-5 h-5 text-[var(--brand-500)]" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                {stats?.avgProcessingTimeHours || 0} <span className="text-xs font-normal text-[var(--text-muted)]">hrs</span>
              </span>
              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Turnaround
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Review Queue Table */}
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-[var(--border)] shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Pending Review Queue</h2>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search patient, policy, procedure..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
              />
            </div>
            <Button type="submit" size="sm" variant="outline" className="text-xs">
              Search
            </Button>
            {searchParam && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSearchInput('');
                  updateQueryParams({ search: undefined, page: 1 });
                }}
                className="text-xs text-gray-500"
              >
                Clear
              </Button>
            )}
          </form>
        </div>

        {isQueueLoading ? (
          <TableSkeleton rows={5} columns={8} />
        ) : queue.length === 0 ? (
          <div className="p-12 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">No pending claims in queue</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              {searchParam
                ? `No claims in queue matched your search query "${searchParam}".`
                : 'All submitted claims have been processed by reviewers.'}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50 text-[var(--text-secondary)] text-xs uppercase font-semibold border-b border-[var(--border)] shadow-xs">
                  <tr>
                    <th className="py-3.5 px-4">Claim ID</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Policy No.</th>
                    <th className="py-3.5 px-4">Procedure</th>
                    <th className="py-3.5 px-4">Submitted By</th>
                    <th className="py-3.5 px-4 text-right">Total Claimed</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {queue.map((claim) => (
                    <tr key={claim._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[var(--brand-700)]">
                        <div className="flex items-center gap-1.5">
                          {claim.flagged && (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" title={claim.flagReason || 'Flagged for Fraud Audit'} />
                          )}
                          <span>#{claim._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                        {claim.patient.name}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[var(--text-secondary)]">
                        {claim.patient.policyNumber}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-medium text-[var(--text-primary)]">{claim.procedure.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{claim.procedure.code}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[var(--text-secondary)]">
                        {claim.submittedBy?.name || 'Provider'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[var(--text-primary)] tabular-nums">
                        ${claim.totalClaimed.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={claim.status} isFlagged={claim.flagged} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          size="sm"
                          onClick={() => handleOpenReviewModal(claim)}
                          className="text-xs bg-[var(--brand-500)] hover:bg-[var(--brand-600)]"
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Server-side Pagination Bar */}
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

      {/* Reviewer Action Modal */}
      {selectedClaim && (
        <StatusTransitionModal
          claim={selectedClaim}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedClaim(null);
          }}
        />
      )}
    </div>
  );
}
