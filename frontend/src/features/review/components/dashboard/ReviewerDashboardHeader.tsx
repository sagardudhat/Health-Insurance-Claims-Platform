import React from 'react';
import Link from 'next/link';
import { User } from '@/features/auth/types';

interface ReviewerDashboardHeaderProps {
  user: User | null;
}

export const ReviewerDashboardHeader = ({ user }: ReviewerDashboardHeaderProps) => {
  return (
    <div className="shrink-0 bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          Welcome, {user?.name || 'Reviewer'}
        </h1>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
          Reviewer Portal
        </span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mt-1">
        Review pending insurance claims below. Use{' '}
        <Link
          href="/reviewer/claims"
          className="text-[var(--brand-500)] font-semibold hover:underline"
        >
          All Claims
        </Link>{' '}
        to browse the full directory.
      </p>
    </div>
  );
};
