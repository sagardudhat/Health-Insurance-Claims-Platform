import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { FileText, ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Claim } from '@/features/claims/types';

interface ReviewerAllClaimsTableProps {
  claims: Claim[];
  isLoading: boolean;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  updateQueryParams: (params: Record<string, string | number | boolean | undefined>) => void;
}

export const ReviewerAllClaimsTable: React.FC<ReviewerAllClaimsTableProps> = ({
  claims,
  isLoading,
  pagination,
  updateQueryParams,
}) => {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] shrink-0 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Claims Directory</h2>
        <span className="text-xs text-[var(--text-muted)] font-medium">
          {pagination?.totalItems || 0} claims
        </span>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} columns={8} />
      ) : claims.length === 0 ? (
        <div className="p-12 text-center space-y-2 flex-1 flex flex-col items-center justify-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">No claims found</h3>
          <p className="text-xs text-[var(--text-muted)]">No claims match the selected filters.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
            <table className="w-full text-left text-sm border-collapse min-w-[760px]">
              <thead className="sticky top-0 z-10 bg-gray-50 text-[var(--text-secondary)] text-xs uppercase font-semibold border-b border-[var(--border)] shadow-xs">
                <tr>
                  <th className="py-3.5 px-4">Claim ID</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Policy Number</th>
                  <th className="py-3.5 px-4">Procedure</th>
                  <th className="py-3.5 px-4">Date of Service</th>
                  <th className="py-3.5 px-4">Total Claimed</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[var(--brand-700)]">
                      #{claim._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                      {claim.patient.name}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-[var(--text-secondary)]">
                      {claim.patient.policyNumber}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-medium text-[var(--text-primary)]">
                        {claim.procedure.name}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)]">
                        {claim.procedure.code}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                      {format(new Date(claim.procedure.dateOfService), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[var(--text-primary)] tabular-nums">
                      ${claim.totalClaimed.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={claim.status} isFlagged={claim.flagged} />
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/reviewer/claims/${claim._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-500)] hover:underline"
                      >
                        <span>View Claim</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
