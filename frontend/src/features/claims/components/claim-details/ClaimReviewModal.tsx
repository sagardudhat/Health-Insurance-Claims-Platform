import React, { useState, useEffect } from 'react';
import { ClipboardCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Claim } from '@/features/claims/types';
import { reviewApi } from '@/features/review/api';

interface ClaimReviewModalProps {
  claim: Claim;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmit: (
    decision: 'APPROVED' | 'PARTIALLY_APPROVED' | 'NEEDS_REVISION' | 'REJECTED',
    note: string,
    deniedItemIds: string[]
  ) => void;
}

export const ClaimReviewModal: React.FC<ClaimReviewModalProps> = ({
  claim,
  isOpen,
  onClose,
  onReviewSubmit,
}) => {
  const [reviewDecision, setReviewDecision] = useState<
    'APPROVED' | 'PARTIALLY_APPROVED' | 'NEEDS_REVISION' | 'REJECTED'
  >('APPROVED');
  const [reviewNote, setReviewNote] = useState<string>('');
  const [deniedItemIds, setDeniedItemIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    approvedItemsTotal: number;
    deductibleApplied: number;
    coveredAmount: number;
    patientResponsibility: number;
  } | null>(null);

  const itemCount = claim.items?.length || 0;
  const isPartialDisabled = itemCount <= 1;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReviewDecision('APPROVED');
      setReviewNote('');
      setDeniedItemIds([]);
      setValidationError(null);
      setPreviewData(null);
    }
  }, [isOpen]);

  // Fetch live coverage preview from backend Policy Engine whenever decision or denied items change
  useEffect(() => {
    if (isOpen && (reviewDecision === 'APPROVED' || reviewDecision === 'PARTIALLY_APPROVED')) {
      const activeDenied = reviewDecision === 'PARTIALLY_APPROVED' ? deniedItemIds : [];
      reviewApi
        .previewCoverage(claim._id, activeDenied)
        .then((res) => {
          setPreviewData({
            approvedItemsTotal: res.approvedItemsTotal,
            deductibleApplied: res.deductibleApplied,
            coveredAmount: res.coveredAmount,
            patientResponsibility: res.patientResponsibility,
          });
        })
        .catch(() => {
          setPreviewData(null);
        });
    } else {
      setPreviewData(null);
    }
  }, [isOpen, claim._id, reviewDecision, deniedItemIds]);

  if (!isOpen) return null;

  const handleClose = () => {
    setReviewDecision('APPROVED');
    setReviewNote('');
    setDeniedItemIds([]);
    setValidationError(null);
    onClose();
  };

  const handleDecisionChange = (
    newDecision: 'APPROVED' | 'PARTIALLY_APPROVED' | 'NEEDS_REVISION' | 'REJECTED'
  ) => {
    if (newDecision === 'PARTIALLY_APPROVED' && isPartialDisabled) return;
    setReviewDecision(newDecision);
    setReviewNote(''); // Clear notes when changing decision!
    setDeniedItemIds([]);
    setValidationError(null);
  };

  const handleSubmit = () => {
    setValidationError(null);

    // Validation 1: Notes required for NEEDS_REVISION or REJECTED
    if (['NEEDS_REVISION', 'REJECTED'].includes(reviewDecision) && !reviewNote.trim()) {
      setValidationError('Please provide a note/reason explaining this decision.');
      return;
    }

    // Validation 2: Partial approval requires selecting at least 1 denied item and leaving at least 1 approved
    if (reviewDecision === 'PARTIALLY_APPROVED') {
      if (deniedItemIds.length === 0) {
        setValidationError('Please check at least one line item to deny for partial approval.');
        return;
      }
      if (deniedItemIds.length >= itemCount) {
        setValidationError(
          'Denying all items is a full rejection. Please select the "Reject" decision instead.'
        );
        return;
      }
    }

    onReviewSubmit(reviewDecision, reviewNote.trim(), deniedItemIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={handleClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-50)] flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-[var(--brand-500)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Submit Review Decision
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Claim #{claim._id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-[var(--text-muted)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <span className="font-semibold">⚠️ {validationError}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Step 1: Decision */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Decision
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'APPROVED',
                  label: '✓ Approve',
                  desc: 'Approve full claim',
                  disabled: false,
                  activeClass:
                    'bg-[var(--status-approved)] border-[var(--status-approved)] text-white',
                },
                {
                  id: 'PARTIALLY_APPROVED',
                  label: '◑ Partial',
                  desc: isPartialDisabled ? 'Requires 2+ items' : 'Approve some items',
                  disabled: isPartialDisabled,
                  activeClass: 'bg-[var(--brand-500)] border-[var(--brand-500)] text-white',
                },
                {
                  id: 'NEEDS_REVISION',
                  label: '↩ Revision',
                  desc: 'Request corrections',
                  disabled: false,
                  activeClass: 'bg-amber-500 border-amber-500 text-white',
                },
                {
                  id: 'REJECTED',
                  label: '✕ Reject',
                  desc: 'Deny this claim',
                  disabled: false,
                  activeClass:
                    'bg-[var(--status-rejected)] border-[var(--status-rejected)] text-white',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => handleDecisionChange(opt.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    opt.disabled
                      ? 'opacity-40 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400'
                      : reviewDecision === opt.id
                        ? `${opt.activeClass} shadow-sm ring-2 ring-offset-1 ring-[var(--brand-500)]/40`
                        : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--brand-500)]/60 cursor-pointer'
                  }`}
                >
                  <div
                    className={`text-sm font-bold ${
                      opt.disabled
                        ? 'text-gray-400'
                        : reviewDecision === opt.id
                          ? 'text-inherit'
                          : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {opt.label}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      opt.disabled
                        ? 'text-gray-400'
                        : reviewDecision === opt.id
                          ? 'opacity-80'
                          : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Partial — select denied items */}
          {reviewDecision === 'PARTIALLY_APPROVED' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Check items to DENY
              </label>
              <div className="border border-[var(--border)] rounded-xl overflow-hidden divide-y divide-[var(--border)]">
                {claim.items.map((item, idx) => {
                  const itemId = item._id || String(idx);
                  const isDenied = deniedItemIds.includes(itemId);
                  return (
                    <label
                      key={idx}
                      className={`flex items-center justify-between px-4 py-2.5 text-xs cursor-pointer transition-colors ${
                        isDenied
                          ? 'bg-red-50 text-red-700'
                          : 'bg-white text-[var(--text-secondary)] hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isDenied}
                          onChange={(e) => {
                            if (e.target.checked) setDeniedItemIds((p) => [...p, itemId]);
                            else setDeniedItemIds((p) => p.filter((id) => id !== itemId));
                          }}
                          className="w-3.5 h-3.5 rounded accent-red-500"
                        />
                        <span className={isDenied ? 'line-through opacity-60' : ''}>
                          {item.description}
                        </span>
                      </div>
                      <span className="font-mono font-semibold">
                        ${(item.quantity * item.unitCost).toFixed(2)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Notes / Reason
              {['NEEDS_REVISION', 'REJECTED'].includes(reviewDecision) && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={3}
              placeholder={
                reviewDecision === 'APPROVED'
                  ? 'Optional — any notes for this approval...'
                  : reviewDecision === 'PARTIALLY_APPROVED'
                    ? 'Explain which items were denied and why...'
                    : reviewDecision === 'NEEDS_REVISION'
                      ? 'Describe what corrections the provider must make...'
                      : 'Provide reason for rejection...'
              }
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:border-[var(--brand-500)] resize-none"
            />
          </div>

          {/* Coverage Preview (approve/partial only) */}
          {(reviewDecision === 'APPROVED' || reviewDecision === 'PARTIALLY_APPROVED') &&
            (() => {
              const activeSum = claim.items.reduce((sum, item, idx) => {
                const itemId = item._id || String(idx);
                if (reviewDecision === 'PARTIALLY_APPROVED' && deniedItemIds.includes(itemId))
                  return sum;
                return sum + item.quantity * item.unitCost;
              }, 0);

              const estCovered = previewData
                ? previewData.coveredAmount
                : Math.max(0, activeSum - 500) * 0.8;
              const estPatient = previewData
                ? previewData.patientResponsibility
                : claim.totalClaimed - estCovered;
              const deductibleApplied = previewData ? previewData.deductibleApplied : 0;

              return (
                <div className="bg-[var(--brand-50)] rounded-xl border border-[var(--brand-500)]/25 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold text-[var(--brand-700)] uppercase tracking-wider">
                      Coverage Preview · 80% Co-Ins.
                    </p>
                    {previewData && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        {deductibleApplied > 0
                          ? `$${deductibleApplied.toFixed(2)} Ded. Applied`
                          : 'Ded. Satisfied ($0 Applied)'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white border border-[var(--border)] rounded-lg p-2">
                      <div className="text-[10px] text-[var(--text-muted)]">Approved Charges</div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        ${(previewData ? previewData.approvedItemsTotal : activeSum).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-[var(--status-approved-bg)] border border-[var(--status-approved)]/30 rounded-lg p-2">
                      <div className="text-[10px] text-[var(--status-approved)] font-semibold">
                        Insurance Payout
                      </div>
                      <div className="text-sm font-bold text-[var(--status-approved)]">
                        ${estCovered.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <div className="text-[10px] text-amber-700 font-semibold">Patient Owes</div>
                      <div className="text-sm font-bold text-amber-700">
                        ${estPatient.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-[var(--border)] flex items-center justify-between gap-3">
          <p className="text-[11px] text-[var(--text-muted)]">
            Decision is logged to the Audit Trail.
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              className="bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-xs font-semibold px-5"
            >
              Confirm Decision
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
