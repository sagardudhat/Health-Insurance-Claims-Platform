'use client';

import React from 'react';
import Link from 'next/link';
import { useMyClaims } from '@/features/claims/hooks';
import { useAuthStore } from '@/features/auth/store';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/ui/skeleton';
import { 
  PlusCircle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

export default function ProviderDashboardPage() {
  const { user } = useAuthStore();
  const { data: responseData, isLoading } = useMyClaims({ page: 1, limit: 5 });

  const claims = responseData?.data || [];
  const totalCount = responseData?.pagination?.total || claims.length;

  const approvedCount = claims.filter((c) => c.status === 'APPROVED' || c.status === 'PARTIALLY_APPROVED').length;
  const pendingCount = claims.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;
  const totalApprovedPayout = claims
    .filter((c) => c.status === 'APPROVED' || c.status === 'PARTIALLY_APPROVED')
    .reduce((sum, c) => sum + (c.approvedAmount || 0), 0);

  return (
    <div className="h-full overflow-y-auto pr-1 space-y-6">
      {/* Provider Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Welcome back, {user?.name || 'Healthcare Provider'}!
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[var(--brand-700)] px-2 py-0.5 rounded border border-blue-100">
              Provider Portal
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track claims status, review insurance reimbursement payouts, and submit new patient billing claims.
          </p>
        </div>

        <Link href="/provider/claims/new">
          <Button size="lg" className="flex items-center gap-2 font-semibold shadow-sm">
            <PlusCircle className="w-5 h-5" />
            <span>Submit New Claim</span>
          </Button>
        </Link>
      </div>

      {/* Provider Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Claims</span>
            <FileText className="w-5 h-5 text-[var(--brand-500)]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">{totalCount}</span>
            <span className="text-xs text-[var(--text-secondary)] font-medium">Submitted</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">{pendingCount}</span>
            <span className="text-xs text-amber-600 font-medium">In Queue</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">{approvedCount}</span>
            <span className="text-xs text-emerald-600 font-medium">Resolved</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Reimbursement</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
              ${totalApprovedPayout.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Payouts</span>
          </div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="bg-gradient-to-r from-[var(--brand-700)] to-[var(--brand-500)] text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-200" />
            <h3 className="text-lg font-bold">Fast & Secure Claims Submission</h3>
          </div>
          <p className="text-xs text-blue-100 max-w-xl">
            Submit itemized patient bills with attached medical PDFs/images. Automated coverage calculation runs instantly upon reviewer assessment.
          </p>
        </div>
        <Link href="/provider/claims/new">
          <Button variant="secondary" className="bg-white text-[var(--brand-700)] hover:bg-blue-50 font-bold text-xs shrink-0">
            Create Claim Form
          </Button>
        </Link>
      </div>

      {/* Recent Claims Preview */}
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--brand-500)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Recent Submitted Claims</h2>
          </div>
          <Link
            href="/provider/claims"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-500)] hover:underline"
          >
            <span>View All Claims</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <TableSkeleton rows={4} columns={6} />
        ) : claims.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--text-muted)]">
            No claims submitted yet.{' '}
            <Link href="/provider/claims/new" className="text-[var(--brand-500)] underline font-semibold">
              Submit your first claim now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead className="bg-gray-50 text-[var(--text-secondary)] uppercase font-semibold border-b border-[var(--border)]">
                <tr>
                  <th className="py-2.5 px-3">Claim ID</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Procedure</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Claimed Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {claims.slice(0, 5).map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-[var(--brand-700)]">
                      #{claim._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">{claim.patient.name}</td>
                    <td className="py-3 px-3 text-[var(--text-secondary)]">{claim.procedure.name}</td>
                    <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                      {format(new Date(claim.procedure.dateOfService), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-3 font-bold text-[var(--text-primary)] tabular-nums">
                      ${claim.totalClaimed.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={claim.status} isFlagged={claim.flagged} />
                    </td>
                    <td className="py-3 px-3">
                      <Link
                        href={`/provider/claims/${claim._id}`}
                        className="text-[var(--brand-500)] hover:underline font-semibold"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
