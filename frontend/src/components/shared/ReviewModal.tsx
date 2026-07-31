'use client';

import React, { useState } from 'react';
import { useUpdateClaimStatus } from '@/features/review/hooks';
import { ClaimStatus } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
  patientName: string;
  procedureName: string;
  totalClaimed: number;
  currentStatus: ClaimStatus;
  items: Array<{ _id?: string; description: string; quantity: number; unitCost: number }>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  claimId,
  patientName,
  procedureName,
  totalClaimed,
  currentStatus,
  items,
}) => {
  const { mutate: updateStatus, isPending } = useUpdateClaimStatus();
  const [toStatus, setToStatus] = useState<ClaimStatus>('APPROVED');
  const [note, setNote] = useState<string>('');
  const [deniedItemIds, setDeniedItemIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if ((toStatus === 'NEEDS_REVISION' || toStatus === 'REJECTED') && !note.trim()) {
      setError('Reviewer notes explaining decision are mandatory for Revisions & Rejections.');
      return;
    }

    updateStatus(
      {
        claimId,
        toStatus,
        note: note.trim(),
        deniedItemIds: toStatus === 'PARTIALLY_APPROVED' ? deniedItemIds : [],
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: any) => {
          setError(err?.response?.data?.message || 'Failed to update claim status.');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-[var(--border)] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-gray-50 shrink-0">
          <div>
            <h3 className="font-bold text-base text-[var(--text-primary)]">Quick Claim Status Transition</h3>
            <p className="text-xs text-[var(--text-secondary)]">Claim #{claimId.slice(-6).toUpperCase()} • {patientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Procedure & Amount Summary */}
          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex justify-between items-center text-xs">
            <div>
              <span className="text-[var(--text-muted)] font-medium">Procedure: </span>
              <span className="font-semibold text-[var(--text-primary)]">{procedureName}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] font-medium">Total Claimed: </span>
              <span className="font-bold text-[var(--brand-700)] tabular-nums">${totalClaimed.toFixed(2)}</span>
            </div>
          </div>

          {/* Decision Status Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Select Transition Decision
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'APPROVED', label: 'Approve Claim', color: 'bg-emerald-600 text-white' },
                { id: 'PARTIALLY_APPROVED', label: 'Partially Approve', color: 'bg-blue-600 text-white' },
                { id: 'NEEDS_REVISION', label: 'Request Revision', color: 'bg-amber-600 text-white' },
                { id: 'REJECTED', label: 'Reject Claim', color: 'bg-red-600 text-white' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setToStatus(opt.id as ClaimStatus)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-all text-left flex items-center justify-between ${
                    toStatus === opt.id
                      ? `${opt.color} shadow-xs ring-2 ring-blue-400`
                      : 'bg-white border-[var(--border)] text-[var(--text-secondary)] hover:bg-gray-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {toStatus === opt.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Partial Denial Checkboxes */}
          {toStatus === 'PARTIALLY_APPROVED' && (
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Select line items to DENY:
              </label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const itemId = item._id || String(idx);
                  const isDenied = deniedItemIds.includes(itemId);
                  return (
                    <label
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-md text-xs cursor-pointer border transition-colors ${
                        isDenied ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isDenied}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDeniedItemIds((prev) => [...prev, itemId]);
                            } else {
                              setDeniedItemIds((prev) => prev.filter((id) => id !== itemId));
                            }
                          }}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span>{item.description} ({item.quantity} x ${item.unitCost})</span>
                      </div>
                      <span className="font-mono font-bold">${(item.quantity * item.unitCost).toFixed(2)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviewer Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Reviewer Notes {toStatus === 'NEEDS_REVISION' || toStatus === 'REJECTED' ? '*' : '(Optional)'}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter decision rationale or revision instructions..."
              className="w-full h-20 px-3 py-2 text-xs rounded-lg border border-[var(--border)] bg-white focus:ring-2 focus:ring-[var(--brand-500)]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[var(--border)]">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isPending}>
              Update Status
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
