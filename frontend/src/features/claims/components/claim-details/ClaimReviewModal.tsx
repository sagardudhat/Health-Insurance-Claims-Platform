import React, { useState } from 'react';
import { ClipboardCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Claim } from '@/features/claims/types';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

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
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-[var(--text-muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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
                  activeClass:
                    'bg-[var(--status-approved)] border-[var(--status-approved)] text-white',
                },
                {
                  id: 'PARTIALLY_APPROVED',
                  label: '◑ Partial',
                  desc: 'Approve some items',
                  activeClass: 'bg-[var(--brand-500)] border-[var(--brand-500)] text-white',
                },
                {
                  id: 'NEEDS_REVISION',
                  label: '↩ Revision',
                  desc: 'Request corrections',
                  activeClass: 'bg-amber-500 border-amber-500 text-white',
                },
                {
                  id: 'REJECTED',
                  label: '✕ Reject',
                  desc: 'Deny this claim',
                  activeClass:
                    'bg-[var(--status-rejected)] border-[var(--status-rejected)] text-white',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setReviewDecision(opt.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    reviewDecision === opt.id
                      ? `${opt.activeClass} shadow-sm ring-2 ring-offset-1 ring-[var(--brand-500)]/40`
                      : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--brand-500)]/60'
                  }`}
                >
                  <div
                    className={`text-sm font-bold ${
                      reviewDecision === opt.id ? 'text-inherit' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {opt.label}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      reviewDecision === opt.id ? 'opacity-80' : 'text-[var(--text-muted)]'
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
              const deductible = Math.min(500, activeSum);
              const estCovered = Math.max(0, activeSum - deductible) * 0.8;
              const estPatient = claim.totalClaimed - estCovered;
              return (
                <div className="bg-[var(--brand-50)] rounded-xl border border-[var(--brand-500)]/25 p-3">
                  <p className="text-[10px] font-semibold text-[var(--brand-700)] uppercase tracking-wider mb-2">
                    Coverage Preview · $500 Ded. + 80% Co-Ins.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white border border-[var(--border)] rounded-lg p-2">
                      <div className="text-[10px] text-[var(--text-muted)]">Claimed</div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        ${claim.totalClaimed.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-[var(--status-approved-bg)] border border-[var(--status-approved)]/30 rounded-lg p-2">
                      <div className="text-[10px] text-[var(--status-approved)] font-semibold">
                        Insurance
                      </div>
                      <div className="text-sm font-bold text-[var(--status-approved)]">
                        ${estCovered.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <div className="text-[10px] text-amber-700 font-semibold">Patient</div>
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
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => onReviewSubmit(reviewDecision, reviewNote, deniedItemIds)}
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
