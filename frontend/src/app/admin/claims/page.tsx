'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAdminAllClaims, useUnflagClaim } from '@/features/admin/hooks';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Claim } from '@/features/claims/types';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'SUBMITTED', label: 'Submitted' },
  { id: 'UNDER_REVIEW', label: 'Under Review' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'PARTIALLY_APPROVED', label: 'Partially Approved' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'NEEDS_REVISION', label: 'Needs Revision' },
  { id: 'PAID', label: 'Paid' },
];

export default function AllClaimsAuditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pageParam = Number(searchParams.get('page')) || 1;
  const limitParam = Number(searchParams.get('limit')) || 10;
  const searchParam = searchParams.get('search') || '';
  const statusParam = searchParams.get('status') || 'ALL';
  const procedureCodeParam = searchParams.get('procedureCode') || '';
  const flaggedOnlyParam = searchParams.get('flaggedOnly') === 'true';

  const [searchInput, setSearchInput] = useState(searchParam);
  const [procedureCodeInput, setProcedureCodeInput] = useState(procedureCodeParam);
  const [selectedClaimToUnflag, setSelectedClaimToUnflag] = useState<Claim | null>(null);
  const [isUnflagConfirmOpen, setIsUnflagConfirmOpen] = useState<boolean>(false);

  useEffect(() => {
    setSearchInput(searchParam);
    setProcedureCodeInput(procedureCodeParam);
  }, [searchParam, procedureCodeParam]);

  const { data: responseData, isLoading } = useAdminAllClaims({
    page: pageParam,
    limit: limitParam,
    search: searchParam,
    status: statusParam,
    procedureCode: procedureCodeInput.trim(),
    flaggedOnly: flaggedOnlyParam ? 'true' : 'false',
  });

  const { mutate: unflagClaim, isPending: isUnflagging } = useUnflagClaim();

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
      procedureCode: procedureCodeInput.trim(),
      page: 1,
    });
  };

  const handleConfirmUnflag = () => {
    if (selectedClaimToUnflag) {
      unflagClaim(selectedClaimToUnflag._id, {
        onSuccess: () => {
          setIsUnflagConfirmOpen(false);
          setSelectedClaimToUnflag(null);
        },
      });
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 overflow-hidden">
      {/* Header Banner */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Platform Claims Audit</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Comprehensive audit table for all submitted health insurance claims. Filter by status, procedure CPT codes, and fraud flags.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="shrink-0 bg-white p-4 rounded-xl border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Status Dropdown Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            <Filter className="w-4 h-4 text-[var(--brand-500)]" />
            <span>Filter Status:</span>
          </div>

          <select
            value={statusParam}
            onChange={(e) => updateQueryParams({ status: e.target.value, page: 1 })}
            className="py-1.5 px-3 text-xs rounded-lg border border-[var(--border)] bg-white font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--brand-500)]"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search & Flagged Filter Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          {/* General Search Input */}
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

          {/* Procedure Code Search Input */}
          <div className="relative">
            <input
              type="text"
              value={procedureCodeInput}
              onChange={(e) => setProcedureCodeInput(e.target.value)}
              placeholder="CPT Code (e.g. CPT-73721)"
              className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white font-mono w-48"
            />
          </div>

          <Button type="submit" size="sm" variant="outline" className="text-xs">
            Apply Filters
          </Button>

          {/* Toggle Flagged Only Button */}
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

      {/* Claims Audit Table Card */}
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] shrink-0 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Audit Claims List</h2>
          <span className="text-xs text-[var(--text-muted)] font-medium">
            Matching Claims: {pagination?.totalItems || 0}
          </span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} columns={9} />
        ) : claims.length === 0 ? (
          <div className="p-12 text-center space-y-2 flex-1 flex flex-col items-center justify-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">No matching claims found</h3>
            <p className="text-xs text-[var(--text-muted)]">
              No insurance claims matched the selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50 text-[var(--text-secondary)] text-xs uppercase font-semibold border-b border-[var(--border)] shadow-xs">
                  <tr>
                    <th className="py-3.5 px-4">Claim ID</th>
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">Policy Number</th>
                    <th className="py-3.5 px-4">Procedure</th>
                    <th className="py-3.5 px-4">Submitted By</th>
                    <th className="py-3.5 px-4 text-right">Total Claimed</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Fraud Status</th>
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
                      <td className="py-3.5 px-4 text-xs font-medium font-mono text-[var(--text-secondary)]">
                        {claim.patient.policyNumber}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-medium text-[var(--text-primary)]">{claim.procedure.name}</div>
                        <div className="text-[10px] font-mono text-[var(--text-muted)]">{claim.procedure.code}</div>
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
                      <td className="py-3.5 px-4 text-xs">
                        {claim.flagged ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
                              <AlertTriangle className="w-3 h-3" />
                              <span>FLAGGED</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedClaimToUnflag(claim);
                                setIsUnflagConfirmOpen(true);
                              }}
                              className="text-[10px] font-semibold text-emerald-600 hover:underline"
                            >
                              Unflag
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium">Normal</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/provider/claims/${claim._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-500)] hover:underline"
                        >
                          <span>Audit</span>
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

      {/* Unflag Confirmation Modal */}
      <ConfirmDialog
        isOpen={isUnflagConfirmOpen}
        title={`Clear Fraud Flag on Claim #${selectedClaimToUnflag?._id.slice(-6).toUpperCase()}`}
        description={`Are you sure you want to remove the fraud flag from this claim? The claim status will return to normal state.`}
        confirmText="Clear Fraud Flag"
        variant="default"
        isLoading={isUnflagging}
        onConfirm={handleConfirmUnflag}
        onClose={() => {
          setIsUnflagConfirmOpen(false);
          setSelectedClaimToUnflag(null);
        }}
      />
    </div>
  );
}
