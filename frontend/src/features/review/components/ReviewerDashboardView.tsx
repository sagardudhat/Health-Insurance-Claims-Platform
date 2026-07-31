'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useReviewerQueue, useReviewerStats } from '@/features/review/hooks';
import { useAuthStore } from '@/features/auth/store';
import { ReviewerDashboardHeader } from './dashboard/ReviewerDashboardHeader';
import { ReviewerDashboardStats } from './dashboard/ReviewerDashboardStats';
import { ReviewerDashboardQueueTable } from './dashboard/ReviewerDashboardQueueTable';

export const ReviewerDashboardView = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pageParam = Number(searchParams.get('page')) || 1;
  const limitParam = Number(searchParams.get('limit')) || 10;
  const searchParam = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(searchParam);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  const { data: responseData, isLoading } = useReviewerQueue({
    page: pageParam,
    limit: limitParam,
    search: searchParam,
  });
  const { data: stats } = useReviewerStats();

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ search: searchInput.trim(), page: 1 });
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-5 overflow-hidden">
      <ReviewerDashboardHeader user={user} />
      <ReviewerDashboardStats stats={stats} pagination={pagination} />
      <ReviewerDashboardQueueTable
        queue={queue}
        pagination={pagination}
        isLoading={isLoading}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearchSubmit={handleSearchSubmit}
        updateQueryParams={updateQueryParams}
        searchParam={searchParam}
      />
    </div>
  );
};
