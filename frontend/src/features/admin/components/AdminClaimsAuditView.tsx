'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAdminAllClaims } from '@/features/admin/hooks';
import { AdminClaimsFilterBar } from './claims-audit/AdminClaimsFilterBar';
import { AdminClaimsTable } from './claims-audit/AdminClaimsTable';

export const AdminClaimsAuditView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pageParam = Number(searchParams.get('page')) || 1;
  const limitParam = Number(searchParams.get('limit')) || 10;
  const searchParam = searchParams.get('search') || '';
  const statusParam = searchParams.get('status') || 'ALL';
  const searchFieldParam = searchParams.get('searchField') || 'all';
  const flaggedOnlyParam = searchParams.get('flaggedOnly') === 'true';

  const { data: responseData, isLoading } = useAdminAllClaims({
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
      {/* Header Banner */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Platform Claims Audit</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Comprehensive audit table for all submitted health insurance claims. Filter by status,
          procedure CPT codes, and fraud flags.
        </p>
      </div>

      <AdminClaimsFilterBar
        statusParam={statusParam}
        searchParam={searchParam}
        searchFieldParam={searchFieldParam}
        flaggedOnlyParam={flaggedOnlyParam}
        updateQueryParams={updateQueryParams}
      />

      <AdminClaimsTable
        claims={claims}
        isLoading={isLoading}
        pagination={pagination}
        updateQueryParams={updateQueryParams}
      />
    </div>
  );
};
