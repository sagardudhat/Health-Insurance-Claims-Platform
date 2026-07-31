'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useReviewerAllClaims } from '@/features/review/hooks';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/skeleton';
import {
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
  FileText,
  List,
} from 'lucide-react';
import { format } from 'date-fns';

import { CLAIM_STATUSES } from '../../../config/constants';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Statuses' },
  { id: CLAIM_STATUSES.SUBMITTED, label: 'Submitted' },
  { id: CLAIM_STATUSES.UNDER_REVIEW, label: 'Under Review' },
  { id: CLAIM_STATUSES.APPROVED, label: 'Approved' },
  { id: CLAIM_STATUSES.PARTIALLY_APPROVED, label: 'Partially Approved' },
  { id: CLAIM_STATUSES.REJECTED, label: 'Rejected' },
  { id: CLAIM_STATUSES.NEEDS_REVISION, label: 'Needs Revision' },
  { id: CLAIM_STATUSES.PAID, label: 'Paid' },
];

const CLAIM_SEARCH_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'patientName', label: 'Patient Name' },
  { id: 'policyNumber', label: 'Policy Number' },
  { id: 'procedureName', label: 'Procedure Name' },
  { id: 'procedureCode', label: 'Procedure / CPT Code' },
];

export default function ReviewerAllClaimsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pageParam = Number(searchParams.get('page')) || 1;
  const limitParam = Number(searchParams.get('limit')) || 10;
  const searchParam = searchParams.get('search') || '';
  const statusParam = searchParams.get('status') || 'ALL';
  const searchFieldParam = searchParams.get('searchField') || 'all';
  const flaggedOnlyParam = searchParams.get('flaggedOnly') === 'true';

  const [searchInput, setSearchInput] = useState(searchParam);
  const [selectedSearchField, setSelectedSearchField] = useState(searchFieldParam);

  useEffect(() => {
    setSearchInput(searchParam);
    setSelectedSearchField(searchFieldParam);
  }, [searchParam, searchFieldParam]);

  const { data: responseData, isLoading } = useReviewerAllClaims({
    page: pageParam,
    limit: limitParam,
    search: searchParam,
    searchField: searchFieldParam,
    status: statusParam,
    flaggedOnly: flaggedOnlyParam ? 'true' : 'false',
  });

  const claims = responseData?.data || [];
  const pagination = responseData?.pagination;

  const updateQueryParams = (newParams: Record<string, string | number | boolean | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === '' || val === null || val === false) {
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
    updateQueryParams({
      search: searchInput.trim(),
      searchField: selectedSearchField,
      page: 1,
    });
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <List className="w-5 h-5 text-[var(--brand-500)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">All Claims</h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Full view of all health insurance claims across all statuses. Click any claim to review it.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="shrink-0 bg-white p-4 rounded-xl border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Status Dropdown Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            <Filter className="w-4 h-4 text-[var(--brand-500)]" />
            <span>Status:</span>
          </div>
          <select
            value={statusParam}
            onChange={(e) => updateQueryParams({ status: e.target.value, page: 1 })}
            className="py-1.5 px-3 text-xs rounded-lg border border-[var(--border)] bg-white font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand-500)]"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSearchField}
            onChange={(e) => setSelectedSearchField(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-[var(--border)] bg-white font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand-500)]"
          >
            {CLAIM_SEARCH_FIELDS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search claims..."
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white w-52"
            />
          </div>

          <Button type="submit" size="sm" variant="outline" className="text-xs">Search</Button>

          {searchParam && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchInput('');
                setSelectedSearchField('all');
                updateQueryParams({ search: undefined, searchField: undefined, page: 1 });
              }}
              className="text-xs text-gray-500"
            >
              Clear
            </Button>
          )}

          {/* Flagged toggle */}
          <button
            type="button"
            onClick={() => updateQueryParams({ flaggedOnly: !flaggedOnlyParam, page: 1 })}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              flaggedOnlyParam
                ? 'bg-red-50 text-red-700 border-red-300 shadow-xs'
                : 'bg-white text-[var(--text-secondary)] border-[var(--border)] hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${flaggedOnlyParam ? 'text-red-600' : 'text-gray-400'}`} />
            <span>Flagged Only</span>
          </button>
        </form>
      </div>

      {/* Claims Table */}
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
                        <div className="font-medium text-[var(--text-primary)]">{claim.procedure.name}</div>
                        <div className="text-[10px] font-mono text-[var(--text-muted)]">{claim.procedure.code}</div>
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
    </div>
  );
}
