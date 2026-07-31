'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useClaimDetails } from '@/features/claims/hooks';
import { useUnflagClaim } from '@/features/admin/hooks';
import { useUpdateClaimStatus } from '@/features/review/hooks';
import { useAuthStore } from '@/features/auth/store';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AuditTrailStepper } from '@/components/shared/AuditTrailStepper';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ClaimDetailsSkeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  AlertTriangle,
  ClipboardCheck,
  PlayCircle,
  Banknote,
  FileText,
} from 'lucide-react';

import { ClaimAlerts } from './claim-details/ClaimAlerts';
import { ClaimEditForm } from './claim-details/ClaimEditForm';
import { ClaimDetailCards } from './claim-details/ClaimDetailCards';
import { ClaimReviewModal } from './claim-details/ClaimReviewModal';
import { EobPdfModal } from './claim-details/EobPdfModal';
import { USER_ROLES, CLAIM_STATUSES } from '@/config/constants';

export const ProviderClaimDetailsView = () => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const claimId = params.id as string;

  const { data, isLoading, isError } = useClaimDetails(claimId);
  const { mutate: unflagClaim, isPending: isUnflagging } = useUnflagClaim();
  const { mutate: updateClaimStatus, isPending: isSubmittingReview } = useUpdateClaimStatus();

  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const userRole =
    user?.role ||
    (pathname.startsWith('/admin')
      ? USER_ROLES.ADMIN
      : pathname.startsWith('/reviewer')
        ? USER_ROLES.REVIEWER
        : USER_ROLES.PROVIDER);

  const isReviewerOrAdmin =
    userRole === USER_ROLES.REVIEWER ||
    userRole === USER_ROLES.ADMIN ||
    pathname.startsWith('/reviewer') ||
    pathname.startsWith('/admin');

  const isProvider =
    userRole === USER_ROLES.PROVIDER ||
    (!pathname.startsWith('/admin') && !pathname.startsWith('/reviewer'));

  // Smart fallback link if direct link / no history
  const backLink = (() => {
    if (typeof window !== 'undefined' && document.referrer) {
      if (document.referrer.includes('/reviewer/claims')) return '/reviewer/claims';
      if (document.referrer.includes('/reviewer/dashboard')) return '/reviewer/dashboard';
      if (document.referrer.includes('/reviewer/queue')) return '/reviewer/queue';
      if (document.referrer.includes('/admin/claims')) return '/admin/claims';
      if (document.referrer.includes('/admin/dashboard')) return '/admin/dashboard';
      if (document.referrer.includes('/provider/claims')) return '/provider/claims';
      if (document.referrer.includes('/provider/dashboard')) return '/provider/dashboard';
    }
    if (pathname.startsWith('/admin')) return '/admin/claims';
    if (pathname.startsWith('/reviewer')) return '/reviewer/claims';
    return '/provider/claims';
  })();

  const handleGoBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(backLink);
    }
  };

  const [isUnflagConfirmOpen, setIsUnflagConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEobModalOpen, setIsEobModalOpen] = useState(false);

  const [confirmAction, setConfirmAction] = useState<null | {
    title: string;
    description: string;
    confirmText: string;
    variant: 'brand' | 'warning' | 'destructive';
    onConfirm: () => void;
  }>(null);

  if (isLoading) return <ClaimDetailsSkeleton />;

  if (isError || !data) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Claim Not Found</h2>
        <p className="text-xs text-[var(--text-muted)]">
          You don&apos;t have access to this claim or it does not exist.
        </p>
        <button
          onClick={handleGoBack}
          className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { claim, auditTrail } = data;

  const handleReviewSubmit = (
    decision: 'APPROVED' | 'PARTIALLY_APPROVED' | 'NEEDS_REVISION' | 'REJECTED',
    note: string,
    deniedItemIds: string[]
  ) => {
    // Close the review decision form modal first so the confirmation dialog is crisp & clear
    setIsReviewModalOpen(false);

    const decisionLabels: Record<string, string> = {
      APPROVED: 'Approve Full Claim',
      PARTIALLY_APPROVED: 'Partially Approve',
      NEEDS_REVISION: 'Request Revision',
      REJECTED: 'Reject Claim',
    };

    setConfirmAction({
      title: `Confirm Decision: ${decisionLabels[decision]}`,
      description:
        decision === 'APPROVED'
          ? 'Are you sure you want to approve this entire claim?'
          : decision === 'PARTIALLY_APPROVED'
            ? `You have marked ${deniedItemIds.length} item(s) as denied. Proceed?`
            : decision === 'NEEDS_REVISION'
              ? 'This will notify the provider to make corrections and resubmit.'
              : 'This will permanently deny the claim for reimbursement.',
      confirmText: 'Submit Decision',
      variant:
        decision === 'REJECTED'
          ? 'destructive'
          : decision === 'NEEDS_REVISION'
            ? 'warning'
            : 'brand',
      onConfirm: () => {
        updateClaimStatus(
          { claimId: claim._id, toStatus: decision, note, deniedItemIds },
          {
            onSuccess: () => setConfirmAction(null),
            onError: () => setConfirmAction(null),
          }
        );
      },
    });
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 overflow-hidden">
      {/* Header Banner */}
      <div className="shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGoBack}
            className="p-1.5 rounded-lg border border-[var(--border)] bg-white text-[var(--text-secondary)] hover:bg-gray-50 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--text-primary)] font-mono">
                Claim #{claim._id.slice(-6).toUpperCase()}
              </h1>
              <StatusBadge status={claim.status} isFlagged={claim.flagged} />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Submitted by Provider:{' '}
              <span className="font-semibold">{claim.submittedBy?.name || 'Provider'}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons for Reviewer / Admin */}
        <div className="flex items-center gap-2">
          {isReviewerOrAdmin && claim.status === 'UNDER_REVIEW' && (
            <Button
              size="sm"
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-xs gap-1.5 shadow-sm"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Review Claim</span>
            </Button>
          )}

          {isReviewerOrAdmin && claim.status === 'SUBMITTED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setConfirmAction({
                  title: 'Start Review',
                  description:
                    'This will mark the claim as "Under Review" and notify the provider. Continue?',
                  confirmText: 'Start Review',
                  variant: 'brand',
                  onConfirm: () => {
                    updateClaimStatus(
                      { claimId: claim._id, toStatus: 'UNDER_REVIEW' },
                      { onSuccess: () => setConfirmAction(null) }
                    );
                  },
                });
              }}
              className="text-xs gap-1.5"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Review</span>
            </Button>
          )}

          {/* Adjudication actions for Admin ONLY */}
          {userRole === 'admin' &&
            (claim.status === 'APPROVED' || claim.status === 'PARTIALLY_APPROVED') && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm"
                onClick={() => {
                  setConfirmAction({
                    title: 'Execute Adjudication & Payment',
                    description:
                      'Are you sure you want to mark this claim as PAID? This simulates generating an EDI 835 remittance advice and executing a wire transfer to the provider.',
                    confirmText: 'Execute Payment',
                    variant: 'brand',
                    onConfirm: () => {
                      updateClaimStatus(
                        { claimId: claim._id, toStatus: 'PAID' },
                        { onSuccess: () => setConfirmAction(null) }
                      );
                    },
                  });
                }}
              >
                <Banknote className="w-4 h-4" />
                <span>Mark as Paid</span>
              </Button>
            )}

          {/* EOB PDF Statement Download Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEobModalOpen(true)}
            className="text-xs gap-1.5 border-[var(--brand-300)] text-[var(--brand-700)] hover:bg-[var(--brand-50)]"
          >
            <FileText className="w-4 h-4" />
            <span>View EOB PDF</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 gap-6">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 pb-20">
          <ClaimAlerts
            claim={claim}
            userRole={userRole}
            onClearFlag={() => setIsUnflagConfirmOpen(true)}
            onStartEdit={isProvider ? () => setIsEditing(true) : undefined}
          />

          {isEditing ? (
            <ClaimEditForm
              claim={claim}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          ) : (
            <ClaimDetailCards claim={claim} token={token} />
          )}
        </div>

        {/* Right Sidebar: Audit Trail */}
        <div className="w-96 lg:w-[390px] xl:w-[420px] shrink-0 bg-white rounded-xl border border-[var(--border)] shadow-xs flex flex-col min-h-0">
          <div className="p-4 border-b border-[var(--border)] shrink-0">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Claim Lifecycle</h3>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <AuditTrailStepper auditTrail={auditTrail} currentStatus={claim.status} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isUnflagConfirmOpen}
        title="Clear Fraud Flag"
        description="Are you sure you want to remove the fraud flag? This means the claim has been manually reviewed and verified as legitimate."
        confirmText="Clear Flag"
        variant="brand"
        isLoading={isUnflagging}
        onConfirm={() =>
          unflagClaim(claim._id, {
            onSuccess: () => setIsUnflagConfirmOpen(false),
          })
        }
        onClose={() => setIsUnflagConfirmOpen(false)}
      />

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.title || ''}
        description={confirmAction?.description || ''}
        confirmText={confirmAction?.confirmText || 'Confirm'}
        variant={confirmAction?.variant || 'brand'}
        isLoading={isSubmittingReview}
        onConfirm={() => confirmAction?.onConfirm()}
        onClose={() => setConfirmAction(null)}
      />

      <ClaimReviewModal
        claim={claim}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmit={handleReviewSubmit}
      />
      {/* EOB PDF Statement Modal */}
      <EobPdfModal
        claim={claim}
        auditTrail={auditTrail}
        isOpen={isEobModalOpen}
        onClose={() => setIsEobModalOpen(false)}
      />
    </div>
  );
};
