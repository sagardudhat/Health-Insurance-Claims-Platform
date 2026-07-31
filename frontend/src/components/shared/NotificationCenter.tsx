'use client';

import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, XCircle, FileText, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/store';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  status?: string;
}

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  useEffect(() => {
    try {
      const socket = getSocket();

      socket.on('claim_status_updated', (data: any) => {
        // Automatically invalidate React Query caches to instantly update tables & views in real-time across tabs!
        queryClient.invalidateQueries({ queryKey: ['myClaims'] });
        queryClient.invalidateQueries({ queryKey: ['claimDetails'] });
        queryClient.invalidateQueries({ queryKey: ['reviewerQueue'] });
        queryClient.invalidateQueries({ queryKey: ['allClaims'] });
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
        queryClient.invalidateQueries({ queryKey: ['myStats'] });

        // Reviewers perform status updates, so they should NOT be notified about their own action
        if (role === 'reviewer') return;

        const claimRef = `#${(data.claimId || '').slice(-6).toUpperCase()}`;

        let title = `Claim Status Updated (${data.toStatus})`;
        let message = `Claim ${claimRef} for ${data.patientName || 'Patient'} moved to ${data.toStatus}.${data.reviewerNotes ? ` Remarks: "${data.reviewerNotes}"` : ''}`;

        if (data.fromStatus === 'NEEDS_REVISION' && data.toStatus === 'UNDER_REVIEW') {
          if (role !== 'provider') {
            title = 'Revised Claim Resubmitted for Review';
            message = `Provider has resubmitted revised claim ${claimRef} for ${data.patientName || 'Patient'} with updated details/documents.`;
          }
        } else if (role === 'provider') {
          title = `Your Claim ${claimRef} Status Updated`;
          message = `Your claim status for ${data.patientName || 'Patient'} is now ${data.toStatus}.${data.reviewerNotes ? ` Remarks: "${data.reviewerNotes}"` : ''}`;
        }

        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          title,
          message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          status: data.toStatus,
        };

        setNotifications((prev) => [newNotif, ...prev]);
      });

      socket.on('claim_submitted', (data: any) => {
        // Automatically invalidate React Query caches so Reviewer Queue & Provider Tables refresh instantly!
        queryClient.invalidateQueries({ queryKey: ['reviewerQueue'] });
        queryClient.invalidateQueries({ queryKey: ['myClaims'] });
        queryClient.invalidateQueries({ queryKey: ['allClaims'] });
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
        queryClient.invalidateQueries({ queryKey: ['myStats'] });

        // ONLY Reviewers and Admins get "New Claim Submitted" notifications
        // Providers perform submissions, so they should NOT get notified about their own action
        if (role === 'provider') return;

        const claimRef = `#${(data.claimId || '').slice(-6).toUpperCase()}`;
        const newNotif: NotificationItem = {
          id: `notif-sub-${Date.now()}`,
          title: 'New Claim Submitted for Review',
          message: `Claim ${claimRef} submitted for ${data.patientName || 'Patient'} ($${data.totalClaimed?.toFixed(2)}).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
        };

        setNotifications((prev) => [newNotif, ...prev]);
      });

      return () => {
        socket.off('claim_status_updated');
        socket.off('claim_submitted');
      };
    } catch (err) {
      console.warn('Socket connection fallback active:', err);
    }
  }, [role, queryClient]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getStatusIcon = (status?: string) => {
    if (status === 'APPROVED' || status === 'PAID') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
    if (status === 'REJECTED') {
      return <XCircle className="w-4 h-4 text-red-600 shrink-0" />;
    }
    if (status === 'NEEDS_REVISION') {
      return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-[var(--brand-600)] shrink-0" />;
  };

  return (
    <div className="relative">
      {/* Trigger Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAllRead();
        }}
        className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Clean User Notifications Popover */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden text-xs">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--brand-600)]" />
              <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 p-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">No new notifications.</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl hover:bg-gray-50 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                      {getStatusIcon(item.status)}
                      {item.title}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">{item.timestamp}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-[11px] pl-5.5">{item.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
