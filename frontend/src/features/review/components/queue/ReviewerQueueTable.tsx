import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Claim } from '@/features/claims/types';

interface ReviewerQueueTableProps {
  queue: Claim[];
  isLoading: boolean;
  searchParam: string;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  updateQueryParams: (params: Record<string, string | number | undefined>) => void;
}

export const ReviewerQueueTable: React.FC<ReviewerQueueTableProps> = ({
  queue,
  isLoading,
  searchParam,
  pagination,
  updateQueryParams,
}) => {
  if (isLoading) return <TableSkeleton rows={5} columns={8} />;

  if (queue.length === 0) {
    return (
      <div className="p-12 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          No pending claims in queue
        </h3>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
          {searchParam
            ? `No claims in queue matched your search query "${searchParam}".`
            : 'All submitted claims have been processed by reviewers.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
        <table className="w-full text-left text-sm border-collapse min-w-[720px]">
          <thead className="sticky top-0 z-10 bg-gray-50 text-[var(--text-secondary)] text-xs uppercase font-semibold border-b border-[var(--border)] shadow-xs">
            <tr>
              <th className="py-3.5 px-4 text-left">Claim ID</th>
              <th className="py-3.5 px-4 text-left">Patient</th>
              <th className="py-3.5 px-4 text-left">Policy No.</th>
              <th className="py-3.5 px-4 text-left">Procedure</th>
              <th className="py-3.5 px-4 text-left">Submitted By</th>
              <th className="py-3.5 px-4 text-left">Total Claimed</th>
              <th className="py-3.5 px-4 text-left">Status</th>
              <th className="py-3.5 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {queue.map((claim) => (
              <tr key={claim._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[var(--brand-700)] text-left">
                  <div className="flex items-center gap-1.5">
                    {claim.flagged && (
                      <span title={claim.flagReason || 'Flagged for Fraud Audit'}>
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      </span>
                    )}
                    <span>#{claim._id.slice(-6).toUpperCase()}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)] text-left">
                  {claim.patient.name}
                </td>
                <td className="py-3.5 px-4 text-xs font-medium text-[var(--text-secondary)] text-left">
                  {claim.patient.policyNumber}
                </td>
                <td className="py-3.5 px-4 text-xs text-left">
                  <div className="font-medium text-[var(--text-primary)]">
                    {claim.procedure.name}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">{claim.procedure.code}</div>
                </td>
                <td className="py-3.5 px-4 text-xs text-[var(--text-secondary)] text-left">
                  {claim.submittedBy?.name || 'Provider'}
                </td>
                <td className="py-3.5 px-4 text-left font-bold text-[var(--text-primary)] tabular-nums">
                  ${claim.totalClaimed.toFixed(2)}
                </td>
                <td className="py-3.5 px-4 text-left">
                  <StatusBadge status={claim.status} isFlagged={claim.flagged} />
                </td>
                <td className="py-3.5 px-4 text-left">
                  <Link
                    href={`/reviewer/claims/${claim._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[var(--brand-500)] text-white px-3.5 py-1.5 rounded-lg hover:bg-[var(--brand-600)] transition-colors shadow-xs"
                  >
                    <span>Review Claim</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
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
  );
};
