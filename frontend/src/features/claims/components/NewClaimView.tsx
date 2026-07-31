'use client';

import React from 'react';
import { NewClaimForm } from './new-claim/NewClaimForm';

export const NewClaimView = () => {
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col min-h-0 space-y-4 overflow-hidden">
      {/* Fixed Sticky Header Banner */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Submit New Insurance Claim
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Enter patient details, treatment procedures, itemized charges, and upload supporting
          medical bills.
        </p>
      </div>

      <NewClaimForm />
    </div>
  );
};
