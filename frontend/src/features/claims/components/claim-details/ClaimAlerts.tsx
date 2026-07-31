import React from 'react';
import { usePathname } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Claim } from '@/features/claims/types';

interface ClaimAlertsProps {
  claim: Claim;
  userRole: string;
  onClearFlag: () => void;
  onStartEdit?: () => void;
}

export const ClaimAlerts: React.FC<ClaimAlertsProps> = ({
  claim,
  userRole,
  onClearFlag,
  onStartEdit,
}) => {
  const pathname = usePathname() || '';
  const canClearFlag = userRole === 'admin' || pathname.startsWith('/admin');

  return (
    <>
      {/* Fraud Flag Alert Banner (If flagged for audit) */}
      {claim.flagged && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 border border-red-200 text-red-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-red-800">Fraud System Flag Alert</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-200 text-red-800 px-2 py-0.5 rounded">
                  Audit Flagged
                </span>
              </div>
              <p className="text-xs text-red-700 mt-0.5">
                {claim.flagReason ||
                  'Total claimed amount exceeds 3x platform historical average for this procedure code.'}
              </p>
            </div>
          </div>

          {canClearFlag && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClearFlag}
              className="bg-white border-red-300 text-red-700 hover:bg-red-50 text-xs shrink-0 font-semibold"
            >
              Clear Fraud Flag
            </Button>
          )}
        </div>
      )}

      {/* Reviewer Note Warning Alert (Only if currently Needs Revision or Rejected) */}
      {claim.reviewerNotes && ['NEEDS_REVISION', 'REJECTED'].includes(claim.status) && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Reviewer Notes & Clarification Requested</span>
            </div>
            {claim.status === 'NEEDS_REVISION' && onStartEdit && (
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                onClick={onStartEdit}
              >
                Edit & Resubmit Claim
              </Button>
            )}
          </div>
          <p className="text-xs leading-relaxed pl-6">{claim.reviewerNotes}</p>
        </div>
      )}
    </>
  );
};
