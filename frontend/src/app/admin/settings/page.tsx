import React from 'react';
import { AdminSettingsView } from '@/features/admin/components/settings/AdminSettingsView';

export const metadata = {
  title: 'System Settings - Admin | Health Claims',
};

export default function AdminSettingsPage() {
  return (
    <div className="h-full p-6 bg-gray-50/50">
      <AdminSettingsView />
    </div>
  );
}
