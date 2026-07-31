'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useReviewerQueue } from '@/features/review/hooks';
import { ReviewerQueueFilterBar } from './queue/ReviewerQueueFilterBar';
import { ReviewerQueueTable } from './queue/ReviewerQueueTable';

export const ReviewerQueueView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pageParam = Number(searchParams.get('page')) || 1;
  const limitParam = Number(searchParams.get('limit')) || 10;
  const searchParam = searchParams.get('search') || '';
  const searchFieldParam = searchParams.get('searchField') || 'all';

  const { data: responseData, isLoading } = useReviewerQueue({
    page: pageParam,
    limit: limitParam,
    search: searchParam,
    searchField: searchFieldParam,
  });

  const queue = responseData?.data || [];
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

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 overflow-hidden">
      {/* Header Banner */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Medical Review Queue</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Review SUBMITTED claims, request revisions for missing documents, or approve items for
          insurance payout.
        </p>
      </div>

      {/* Review Queue Table Card */}
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs flex-1 flex flex-col min-h-0 overflow-hidden">
        <ReviewerQueueFilterBar
          searchParam={searchParam}
          searchFieldParam={searchFieldParam}
          updateQueryParams={updateQueryParams}
        />

        <ReviewerQueueTable
          queue={queue}
          isLoading={isLoading}
          searchParam={searchParam}
          pagination={pagination}
          updateQueryParams={updateQueryParams}
        />
      </div>
    </div>
  );
};
