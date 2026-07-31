'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useReviewerAllClaims } from '@/features/review/hooks';
import { List } from 'lucide-react';
import { ReviewerAllClaimsFilterBar } from './all-claims/ReviewerAllClaimsFilterBar';
import { ReviewerAllClaimsTable } from './all-claims/ReviewerAllClaimsTable';

export const ReviewerAllClaimsView = () => {
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

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <List className="w-5 h-5 text-[var(--brand-500)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">All Claims</h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Full view of all health insurance claims across all statuses. Click any claim to review
          it.
        </p>
      </div>

      <ReviewerAllClaimsFilterBar
        searchParam={searchParam}
        statusParam={statusParam}
        searchFieldParam={searchFieldParam}
        flaggedOnlyParam={flaggedOnlyParam}
        updateQueryParams={updateQueryParams}
        setSearchInput={setSearchInput}
        setSelectedSearchField={setSelectedSearchField}
      />

      <ReviewerAllClaimsTable
        claims={claims}
        isLoading={isLoading}
        pagination={pagination}
        updateQueryParams={updateQueryParams}
      />
    </div>
  );
};
