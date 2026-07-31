import React, { useState } from 'react';
import { format } from 'date-fns';
import { Shield, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/skeleton';
import { User } from '@/features/auth/types';
import { useUpdateUserStatus } from '@/features/admin/hooks';

interface UserManagementTableProps {
  displayUsers: User[];
  isLoading: boolean;
  searchParam: string;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  updateQueryParams: (params: Record<string, string | number | undefined>) => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  displayUsers,
  isLoading,
  searchParam,
  pagination,
  updateQueryParams,
}) => {
  const { mutate: updateUserStatus, isPending } = useUpdateUserStatus();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleToggleStatus = (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    if (nextStatus === 'suspended') {
      setSelectedUser(user);
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
    <>
      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : displayUsers.length === 0 ? (
        <div className="p-12 text-center text-gray-500 text-sm flex-1 flex items-center justify-center">
          {searchParam
            ? `No users matched your search query "${searchParam}".`
            : 'No user accounts found.'}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
            <table className="w-full text-left text-sm border-collapse min-w-[650px]">
              <thead className="sticky top-0 z-10 bg-gray-50 text-[var(--text-secondary)] text-xs uppercase font-semibold border-b border-[var(--border)] shadow-xs">
                <tr>
                  <th className="py-3.5 px-4 text-left">User Name</th>
                  <th className="py-3.5 px-4 text-left">Email Address</th>
                  <th className="py-3.5 px-4 text-left">Role</th>
                  <th className="py-3.5 px-4 text-left">Registered Date</th>
                  <th className="py-3.5 px-4 text-left">Account Status</th>
                  <th className="py-3.5 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {displayUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)] text-left">
                      {user.name}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-[var(--text-secondary)] text-left">
                      {user.email}
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-50 text-blue-700 border border-blue-200">
                        <Shield className="w-3 h-3" />
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[var(--text-secondary)] whitespace-nowrap text-left">
                      {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-left">
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
                    <td className="py-3.5 px-4 text-left">
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
    </>
  );
};
