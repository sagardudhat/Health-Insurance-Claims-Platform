import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { FileText, ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Claim } from '@/features/claims/types';

interface ProviderClaimsTableProps {
  claims: Claim[];
  isLoading: boolean;
  isError: boolean;
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
  setSearchInput: (val: string) => void;
  setSelectedSearchField: (val: string) => void;
  setSelectedStatus: (val: string) => void;
}

export const ProviderClaimsTable: React.FC<ProviderClaimsTableProps> = ({
  claims,
  isLoading,
  isError,
  searchParam,
  pagination,
  updateQueryParams,
  setSearchInput,
  setSelectedSearchField,
  setSelectedStatus,
}) => {
  return (
    <>
      {isLoading ? (
        <TableSkeleton rows={5} columns={8} />
      ) : isError ? (
        <div className="p-8 text-center text-red-600 text-sm font-medium flex-1 flex items-center justify-center">
          Failed to load submitted claims. Please try logging in again.
        </div>
      ) : claims.length === 0 ? (
        <div className="p-12 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            No matching claims found
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {searchParam
              ? `No claims matched your search query "${searchParam}".`
              : 'You have not submitted any health insurance claims yet.'}
          </p>
          {searchParam ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchInput('');
                setSelectedSearchField('all');
                setSelectedStatus('ALL');
                updateQueryParams({
                  search: undefined,
                  searchField: undefined,
                  status: undefined,
                  page: 1,
                });
              }}
            >
              Reset Search
            </Button>
          ) : (
            <Link href="/provider/claims/new" className="inline-block">
              <Button variant="outline" size="sm">
                Submit First Claim
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
            <table className="w-full text-left text-sm border-collapse min-w-[680px]">
              <thead className="sticky top-0 z-10 bg-gray-50 text-[var(--text-secondary)] text-xs uppercase font-semibold border-b border-[var(--border)] shadow-xs">
                <tr>
                  <th className="py-3.5 px-4 text-left">Claim ID</th>
                  <th className="py-3.5 px-4 text-left">Patient</th>
                  <th className="py-3.5 px-4 text-left">Policy No.</th>
                  <th className="py-3.5 px-4 text-left">Procedure</th>
                  <th className="py-3.5 px-4 text-left">Date of Service</th>
                  <th className="py-3.5 px-4 text-left">Total Claimed</th>
                  <th className="py-3.5 px-4 text-left">Status</th>
                  <th className="py-3.5 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[var(--brand-700)] text-left">
                      #{claim._id.slice(-6).toUpperCase()}
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
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {claim.procedure.code}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[var(--text-secondary)] whitespace-nowrap text-left">
                      {format(new Date(claim.procedure.dateOfService), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3.5 px-4 text-left font-bold text-[var(--text-primary)] tabular-nums">
                      ${claim.totalClaimed.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      <StatusBadge status={claim.status} isFlagged={claim.flagged} />
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      <Link
                        href={`/provider/claims/${claim._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-500)] hover:underline"
                      >
                        <span>View Details</span>
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
      )}
    </>
  );
};
