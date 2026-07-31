import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DashboardActionBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-[var(--brand-700)] to-[var(--brand-500)] text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-200" />
          <h3 className="text-lg font-bold">Fast & Secure Claims Submission</h3>
        </div>
        <p className="text-xs text-blue-100 max-w-xl">
          Submit itemized patient bills with attached medical PDFs/images. Automated coverage
          calculation runs instantly upon reviewer assessment.
        </p>
      </div>
      <Link href="/provider/claims/new">
        <Button
          variant="secondary"
          className="bg-white text-[var(--brand-700)] hover:bg-blue-50 font-bold text-xs shrink-0"
        >
          Create Claim Form
        </Button>
      </Link>
    </div>
  );
};
