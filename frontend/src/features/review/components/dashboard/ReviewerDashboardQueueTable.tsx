import React from 'react';
import Link from 'next/link';
import { Claim } from '@/features/claims/types';
import { PaginatedResponse } from '@/features/claims/types';
type PaginationData = PaginatedResponse<any>['pagination'];
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle2, ShieldAlert, Search } from 'lucide-react';

interface ReviewerDashboardQueueTableProps {
  queue: Claim[];
  pagination?: PaginationData;
  isLoading: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  updateQueryParams: (params: Record<string, string | number | undefined>) => void;
  searchParam: string;
}

export const ReviewerDashboardQueueTable = ({
  queue,
  pagination,
  isLoading,
  searchInput,
  setSearchInput,
  handleSearchSubmit,
  updateQueryParams,
  searchParam,
}: ReviewerDashboardQueueTableProps) => {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Table Header + Search */}
      <div className="shrink-0 p-4 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[var(--brand-500)]" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Pending Review Queue
          </h2>
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

      {/* Table Body */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : queue.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <p className="font-semibold text-sm text-[var(--text-primary)]">Queue is clear!</p>
          <p className="text-xs text-[var(--text-muted)]">
            No pending claims require review right now.
          </p>
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
                        {claim.flagged && (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        )}
                        <span>#{claim._id.slice(-6).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      {claim.patient.name}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-[var(--text-secondary)]">
                      {claim.patient.policyNumber}
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                      {claim.procedure.name}
                    </td>
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
  );
};
