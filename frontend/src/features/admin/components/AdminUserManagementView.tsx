'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAdminUsers } from '@/features/admin/hooks';
import { UserSearchFilter } from './user-management/UserSearchFilter';
import { UserManagementTable } from './user-management/UserManagementTable';
import { Users } from 'lucide-react';

export const AdminUserManagementView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const pageParam = Number(searchParams.get('page')) || 1;
  const limitParam = Number(searchParams.get('limit')) || 10;
  const searchParamVal = searchParams.get('search') || '';
  const searchFieldParam = searchParams.get('searchField') || 'all';

  const { data: responseData, isLoading } = useAdminUsers({
    page: pageParam,
    limit: limitParam,
    search: searchParamVal,
    searchField: searchFieldParam,
  });

  const displayUsers = responseData?.data || [];
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
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-[var(--brand-500)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">User Accounts Manager</h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Manage system access for Providers, Reviewers, and internal Administrators.
        </p>
      </div>

      {/* User Management Table Card */}
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs flex-1 flex flex-col min-h-0 overflow-hidden">
        <UserSearchFilter
          searchParam={searchParamVal}
          searchFieldParam={searchFieldParam}
          updateQueryParams={updateQueryParams}
        />

        <UserManagementTable
          displayUsers={displayUsers}
          isLoading={isLoading}
          searchParam={searchParamVal}
          pagination={pagination}
          updateQueryParams={updateQueryParams}
        />
      </div>
    </div>
  );
};
