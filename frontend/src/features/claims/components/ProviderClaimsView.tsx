'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useMyClaims } from '@/features/claims/hooks';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ProviderClaimsFilterBar } from './claims-list/ProviderClaimsFilterBar';
import { ProviderClaimsTable } from './claims-list/ProviderClaimsTable';

export const ProviderClaimsView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pageParam = Number(searchParams.get('page')) || 1;
  const limitParam = Number(searchParams.get('limit')) || 10;
  const searchParam = searchParams.get('search') || '';
  const searchFieldParam = searchParams.get('searchField') || 'all';
  const statusParam = searchParams.get('status') || 'ALL';

  const [searchInput, setSearchInput] = useState(searchParam);
  const [selectedSearchField, setSelectedSearchField] = useState(searchFieldParam);
  const [selectedStatus, setSelectedStatus] = useState(statusParam);

  const {
    data: responseData,
    isLoading,
    isError,
  } = useMyClaims({
    page: pageParam,
    limit: limitParam,
    search: searchParam,
    searchField: searchFieldParam,
    status: statusParam,
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

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 overflow-hidden">
      {/* Header Banner */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Claims Directory</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Complete list of submitted health insurance claims with search filters and real-time
            status tracking.
          </p>
        </div>
        <Link href="/provider/claims/new">
          <Button className="flex items-center gap-2 font-semibold">
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Claim</span>
          </Button>
        </Link>
      </div>

      {/* Claims Table Section */}
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs flex-1 flex flex-col min-h-0 overflow-hidden">
        <ProviderClaimsFilterBar
          searchParam={searchParam}
          searchFieldParam={searchFieldParam}
          statusParam={statusParam}
          updateQueryParams={updateQueryParams}
        />

        <ProviderClaimsTable
          claims={claims}
          isLoading={isLoading}
          isError={isError}
          searchParam={searchParam}
          pagination={pagination}
          updateQueryParams={updateQueryParams}
          setSearchInput={setSearchInput}
          setSelectedSearchField={setSelectedSearchField}
          setSelectedStatus={setSelectedStatus}
        />
      </div>
    </div>
  );
};
