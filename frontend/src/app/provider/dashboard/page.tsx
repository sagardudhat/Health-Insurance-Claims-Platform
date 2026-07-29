'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useMyClaims } from '@/features/claims/hooks';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/skeleton';
import { PlusCircle, FileText, Calendar, ArrowRight, Search, User } from 'lucide-react';
import { format } from 'date-fns';

export default function ProviderDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pageParam = Number(searchParams.get('page')) || 1;
  const limitParam = Number(searchParams.get('limit')) || 10;
  const searchParam = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(searchParam);

  // Keep search input in sync if URL changes
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  const { data: responseData, isLoading, isError } = useMyClaims({
    page: pageParam,
    limit: limitParam,
    search: searchParam,
  });

  const claims = responseData?.data || [];
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
    <div className="h-full flex flex-col min-h-0 space-y-4 overflow-hidden">
      {/* Header Banner */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Provider Claims Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage your submitted health insurance claims, track approval statuses, and review decisions.
          </p>
        </div>
        <Link href="/provider/claims/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Claim</span>
          </Button>
        </Link>
      </div>

      {/* Claims Table Section */}
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-[var(--border)] shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Submitted Claims History</h2>

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

        {isLoading ? (
          <TableSkeleton rows={5} columns={8} />
        ) : isError ? (
          <div className="p-8 text-center text-red-600 text-sm font-medium flex-1 flex items-center justify-center">
            Failed to load submitted claims. Please try logging in again.
          </div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">No matching claims found</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              {searchParam
                ? `No claims matched your search query "${searchParam}".`
                : "You haven't submitted any insurance claims yet."}
            </p>
            {searchParam ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  updateQueryParams({ search: undefined, page: 1 });
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
              <table className="w-full text-left text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50 text-[var(--text-secondary)] text-xs uppercase font-semibold border-b border-[var(--border)] shadow-xs">
                  <tr>
                    <th className="py-3.5 px-4">Claim ID</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Policy No.</th>
                    <th className="py-3.5 px-4">Procedure</th>
                    <th className="py-3.5 px-4">Date of Service</th>
                    <th className="py-3.5 px-4 text-right">Total Claimed</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
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
                      <td className="py-3.5 px-4 text-xs font-medium text-[var(--text-secondary)]">
                        {claim.patient.policyNumber}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-medium text-[var(--text-primary)]">{claim.procedure.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{claim.procedure.code}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                        {format(new Date(claim.procedure.dateOfService), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[var(--text-primary)] tabular-nums">
                        ${claim.totalClaimed.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={claim.status} isFlagged={claim.flagged} />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/provider/claims/${claim._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-500)] hover:underline"
                        >
                          <span>View</span>
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
      </div>
    </div>
  );
}
