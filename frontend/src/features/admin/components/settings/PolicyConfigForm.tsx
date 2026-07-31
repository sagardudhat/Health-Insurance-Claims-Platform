'use client';

import React, { useState } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PolicyConfig } from '../../api';

interface PolicyConfigFormProps {
  config: PolicyConfig;
  onSave: (data: { annualLimit: number; deductible: number; coverageRate: number }) => void;
  isSaving: boolean;
}

export const PolicyConfigForm = ({ config, onSave, isSaving }: PolicyConfigFormProps) => {
  const [annualLimit, setAnnualLimit] = useState(config.annualLimit.toString());
  const [deductible, setDeductible] = useState(config.deductible.toString());
  const [coverageRate, setCoverageRate] = useState((config.coverageRate * 100).toString());
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAnnualLimit = Number(annualLimit);
    const parsedDeductible = Number(deductible);
    const parsedCoverageRate = Number(coverageRate) / 100;

    if (parsedDeductible > parsedAnnualLimit) {
      setError('Deductible cannot be greater than the Annual Coverage Limit.');
      return;
    }

    onSave({
      annualLimit: parsedAnnualLimit,
      deductible: parsedDeductible,
      coverageRate: parsedCoverageRate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold">Important Configuration Notice</p>
          <p className="mt-1 opacity-90">
            Modifying these values will immediately affect all newly calculated claims for the year{' '}
            {config.year}. Previously calculated claims will retain their approved amounts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
            Annual Coverage Limit ($)
          </label>
          <input
            type="number"
            min="0"
            step="100"
            required
            value={annualLimit}
            onChange={(e) => setAnnualLimit(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-500)] outline-none transition-shadow"
          />
          <p className="text-xs text-[var(--text-muted)]">Maximum payout per patient per year.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
            Patient Deductible ($)
          </label>
          <input
            type="number"
            min="0"
            step="50"
            required
            value={deductible}
            onChange={(e) => setDeductible(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-500)] outline-none transition-shadow"
          />
          <p className="text-xs text-[var(--text-muted)]">
            Amount patient pays before coverage kicks in.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
            Insurance Coverage Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            required
            value={coverageRate}
            onChange={(e) => setCoverageRate(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-500)] outline-none transition-shadow"
          />
          <p className="text-xs text-[var(--text-muted)]">
            Percentage of eligible costs covered by insurance.
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white gap-2"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Configuration
        </Button>
      </div>
    </form>
  );
};
