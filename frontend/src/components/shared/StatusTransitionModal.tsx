'use client';

import React, { useState } from 'react';
import { Claim, LineItem } from '@/features/claims/types';
import { ClaimStatus, StatusBadge } from './StatusBadge';
import { getLegalNextStatuses } from '@/features/review/transitionMap';
import { useUpdateClaimStatus } from '@/features/review/hooks';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileCheck,
  FileX,
  RefreshCw,
} from 'lucide-react';

interface StatusTransitionModalProps {
  claim: Claim;
  isOpen: boolean;
  onClose: () => void;
}

export const StatusTransitionModal: React.FC<StatusTransitionModalProps> = ({
  claim,
  isOpen,
  onClose,
}) => {
  const { mutate: updateStatus, isPending, error: updateError } = useUpdateClaimStatus();
  const legalNextStatuses = getLegalNextStatuses(claim.status);

  const [selectedStatus, setSelectedStatus] = useState<ClaimStatus>(
    legalNextStatuses[0] || 'UNDER_REVIEW'
  );
  const [note, setNote] = useState<string>('');
  const [deniedItemIds, setDeniedItemIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleItemDenial = (itemId?: string) => {
    if (!itemId) return;
    setDeniedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleStatusChange = (status: ClaimStatus) => {
    setSelectedStatus(status);
    setValidationError(null);
    if (status === 'APPROVED') {
      setDeniedItemIds([]);
    }
  };

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (selectedStatus === 'NEEDS_REVISION' && (!note || note.trim().length === 0)) {
      setValidationError(
        'A detailed reviewer note explaining the revision requirements is mandatory.'
      );
      return;
    }

    if (selectedStatus === 'PARTIALLY_APPROVED' && deniedItemIds.length === 0) {
      setValidationError('Please select at least one line item to deny for Partial Approval.');
      return;
    }

    setShowConfirm(true);
  };

  const handleExecuteStatusUpdate = () => {
    updateStatus(
      {
        claimId: claim._id,
        toStatus: selectedStatus,
        note: note.trim(),
        deniedItemIds,
      },
      {
        onSuccess: () => {
          setShowConfirm(false);
          onClose();
        },
        onError: () => {
          setShowConfirm(false);
        },
      }
    );
  };

  const serverError =
    (updateError as any)?.response?.data?.message ||
    (updateError ? 'Failed to update claim status.' : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl border border-[var(--border)] shadow-xl max-w-lg w-full overflow-hidden space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-gray-50">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Process Claim Status
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Claim ID: #{claim._id.slice(-6).toUpperCase()} — Policy {claim.patient.policyNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitClick} className="p-5 space-y-4">
          {/* Current Status Display */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs">
            <span className="font-semibold text-[var(--text-secondary)]">
              Current Workflow State:
            </span>
            <StatusBadge status={claim.status} isFlagged={claim.flagged} />
          </div>

          {(validationError || serverError) && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{validationError || serverError}</span>
            </div>
          )}

          {/* Legal Next Status Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] block">
              Select Legal Next Action
            </label>
            {legalNextStatuses.length === 0 ? (
              <p className="text-xs text-amber-700 font-medium p-3 bg-amber-50 rounded-lg">
                This claim has reached a terminal status ({claim.status}) and cannot be transitioned
                further.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {legalNextStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    className={`p-3 text-xs font-semibold rounded-lg border text-left transition-all flex flex-col gap-1 ${
                      selectedStatus === status
                        ? 'border-[var(--brand-500)] bg-[var(--brand-50)] text-[var(--brand-700)] shadow-xs'
                        : 'border-[var(--border)] bg-white text-[var(--text-secondary)] hover:bg-gray-50'
                    }`}
                  >
                    <span className="capitalize">{status.replace('_', ' ').toLowerCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Denial Selection for PARTIALLY_APPROVED */}
          {selectedStatus === 'PARTIALLY_APPROVED' && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
              <p className="text-xs font-semibold text-amber-900">
                Select line items to DENY (Remaining items will be approved):
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {claim.items.map((item, idx) => {
                  const itemId = item._id?.toString() || `${idx}`;
                  const isDenied = deniedItemIds.includes(itemId);
                  return (
                    <label
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded border text-xs cursor-pointer ${
                        isDenied
                          ? 'bg-red-100 border-red-300 text-red-900'
                          : 'bg-white border-amber-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isDenied}
                          onChange={() => toggleItemDenial(itemId)}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        <span className="font-medium">{item.description}</span>
                      </div>
                      <span className="font-mono font-bold tabular-nums">
                        ${(item.quantity * item.unitCost).toFixed(2)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviewer Note Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)] block">
              Reviewer Reasoning / Remarks {selectedStatus === 'NEEDS_REVISION' ? '*' : ''}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                selectedStatus === 'NEEDS_REVISION'
                  ? 'Specify missing documents or required corrections...'
                  : 'Enter review comments...'
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={legalNextStatuses.length === 0}>
              Confirm Transition
            </Button>
          </div>
        </form>
      </div>

      {/* Critical Action Confirmation Dialog Pop-up */}
      <ConfirmDialog
        isOpen={showConfirm}
        title={`Confirm Status Transition to ${selectedStatus}`}
        description={`Are you sure you want to transition Claim #${claim._id.slice(-6).toUpperCase()} to ${selectedStatus}? This action will recompute coverage rules and record an immutable audit log entry.`}
        confirmText={`Transition to ${selectedStatus}`}
        variant={
          selectedStatus === 'REJECTED'
            ? 'destructive'
            : selectedStatus === 'NEEDS_REVISION'
              ? 'warning'
              : 'brand'
        }
        isLoading={isPending}
        onConfirm={handleExecuteStatusUpdate}
        onClose={() => setShowConfirm(false)}
      />
    </div>
  );
};
