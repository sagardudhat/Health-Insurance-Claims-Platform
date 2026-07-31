import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Activity, ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Claim } from '@/features/claims/types';

interface RecentClaimsTableProps {
  claims: Claim[];
  isLoading: boolean;
}

export const RecentClaimsTable: React.FC<RecentClaimsTableProps> = ({ claims, isLoading }) => {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs space-y-4 p-5">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--brand-500)]" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Recent Submitted Claims
          </h2>
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
          <Link
            href="/provider/claims/new"
            className="text-[var(--brand-500)] underline font-semibold"
          >
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
                  <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                    {claim.patient.name}
                  </td>
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
  );
};
