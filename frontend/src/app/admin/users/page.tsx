'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAdminUsers, useUpdateUserStatus } from '@/features/admin/hooks';
import { useAuthStore } from '@/features/auth/store';
import { User } from '@/features/auth/types';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Users, Shield, UserCheck, UserX, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function UserManagementPage() {
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

  const { data: responseData, isLoading } = useAdminUsers({
    page: pageParam,
    limit: limitParam,
    search: searchParam,
  });

  const { mutate: updateUserStatus, isPending } = useUpdateUserStatus();
  const currentUser = useAuthStore((state) => state.user);

  const users = responseData?.data || [];
  const pagination = responseData?.pagination;

  const displayUsers = users.filter((u) => u._id !== currentUser?._id);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [targetStatus, setTargetStatus] = useState<'active' | 'suspended'>('suspended');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  const handleToggleStatus = (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    setSelectedUser(user);
    setTargetStatus(nextStatus);

    if (nextStatus === 'suspended') {
      setIsConfirmOpen(true);
    } else {
      updateUserStatus({ userId: user._id, status: 'active' });
    }
  };

  const handleConfirmSuspension = () => {
    if (selectedUser) {
      updateUserStatus(
        { userId: selectedUser._id, status: 'suspended' },
        {
          onSuccess: () => {
            setIsConfirmOpen(false);
            setSelectedUser(null);
          },
        }
      );
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 overflow-hidden">
      {/* Header Banner */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">User Account Management</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          View all registered healthcare providers, claims reviewers, and insurer admins. Toggle active and suspended statuses.
        </p>
      </div>

      {/* User Table Card */}
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-[var(--border)] shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--brand-500)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Registered Platform Accounts</h2>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
              />
            </div>
            <Button type="submit" size="sm" variant="outline" className="text-xs">
              Search
            </Button>
            {searchParam && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSearchInput('');
                  updateQueryParams({ search: undefined, page: 1 });
                }}
                className="text-xs text-gray-500"
              >
                Clear
              </Button>
            )}
          </form>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : displayUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm flex-1 flex items-center justify-center">
            {searchParam ? `No users matched your search query "${searchParam}".` : 'No user accounts found.'}
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50 text-[var(--text-secondary)] text-xs uppercase font-semibold border-b border-[var(--border)] shadow-xs">
                  <tr>
                    <th className="py-3.5 px-4">User Name</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Registered Date</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {displayUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                        {user.name}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-[var(--text-secondary)]">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-50 text-blue-700 border border-blue-200">
                          <Shield className="w-3 h-3" />
                          <span>{user.role}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        {user.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          size="sm"
                          variant={user.status === 'active' ? 'destructive' : 'outline'}
                          onClick={() => handleToggleStatus(user)}
                          className="text-xs"
                        >
                          {user.status === 'active' ? (
                            <>
                              <UserX className="w-3.5 h-3.5 mr-1" />
                              <span>Suspend</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              <span>Activate</span>
                            </>
                          )}
                        </Button>
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

      {/* Confirmation Dialog Modal for Account Suspension */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={`Suspend Account for ${selectedUser?.name}`}
        description={`Are you sure you want to suspend ${selectedUser?.email}? When suspended, their active JWT session token will be immediately revoked and they will be blocked from accessing any API endpoints or portal features.`}
        confirmText="Suspend Account"
        variant="destructive"
        isLoading={isPending}
        onConfirm={handleConfirmSuspension}
        onClose={() => {
          setIsConfirmOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}
