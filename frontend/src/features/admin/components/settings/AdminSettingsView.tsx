'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { usePolicyConfig, useUpdatePolicyConfig } from '../../hooks';
import { PolicyConfigForm } from './PolicyConfigForm';

export const AdminSettingsView = () => {
  const currentYear = new Date().getFullYear();
  const { data: config, isLoading, error } = usePolicyConfig(currentYear);
  const { mutate: updateConfig, isPending } = useUpdatePolicyConfig();

  const handleSave = (data: { annualLimit: number; deductible: number; coverageRate: number }) => {
    updateConfig({ year: currentYear, ...data });
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[var(--brand-50)] text-[var(--brand-600)] rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            System Settings
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Manage global platform configurations and policy rules.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Policy Rules ({currentYear})
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            These rules dictate how claims are calculated and adjudicated across the platform.
          </p>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-16 bg-gray-100 rounded-lg w-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-12 bg-gray-100 rounded-lg"></div>
                <div className="h-12 bg-gray-100 rounded-lg"></div>
                <div className="h-12 bg-gray-100 rounded-lg"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm">Failed to load policy configuration.</div>
          ) : config ? (
            <PolicyConfigForm config={config} onSave={handleSave} isSaving={isPending} />
          ) : null}
        </div>
      </div>
    </div>
  );
};
