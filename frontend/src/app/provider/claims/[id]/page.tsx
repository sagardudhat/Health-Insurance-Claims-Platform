'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useClaimDetails, useResubmitClaim } from '@/features/claims/hooks';
import { useUnflagClaim } from '@/features/admin/hooks';
import { useUpdateClaimStatus } from '@/features/review/hooks';
import { useAuthStore } from '@/features/auth/store';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ClaimDetailsSkeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  DollarSign, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Activity,
  Loader2,
  History,
  Plus,
  Trash2,
  Upload,
  X,
  ClipboardCheck,
  PlayCircle,
  Banknote
} from 'lucide-react';
import { format } from 'date-fns';

export default function ClaimDetailsPage() {
  const params = useParams();
  const pathname = usePathname();
  const claimId = params.id as string;
  const { data, isLoading, isError } = useClaimDetails(claimId);
  const { mutate: resubmitClaim, isPending: isResubmitting } = useResubmitClaim(claimId);
  const { mutate: unflagClaim, isPending: isUnflagging } = useUnflagClaim();
  const { mutate: updateClaimStatus, isPending: isSubmittingReview } = useUpdateClaimStatus();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || (pathname.startsWith('/admin') ? 'admin' : pathname.startsWith('/reviewer') ? 'reviewer' : 'provider');
  const isReviewerOrAdmin = userRole === 'reviewer' || userRole === 'admin' || pathname.startsWith('/reviewer') || pathname.startsWith('/admin');

  const backLink = pathname.startsWith('/admin')
    ? '/admin/claims'
    : pathname.startsWith('/reviewer')
    ? '/reviewer/queue'
    : '/provider/claims';

  const [isUnflagConfirmOpen, setIsUnflagConfirmOpen] = useState<boolean>(false);

  // Shared confirmation state for all reviewer actions
  const [confirmAction, setConfirmAction] = useState<null | {
    title: string;
    description: string;
    confirmText: string;
    variant: 'brand' | 'warning' | 'destructive';
    onConfirm: () => void;
  }>(null);

  // Reviewer Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewDecision, setReviewDecision] = useState<'APPROVED' | 'PARTIALLY_APPROVED' | 'NEEDS_REVISION' | 'REJECTED'>('APPROVED');
  const [reviewNote, setReviewNote] = useState<string>('');
  const [deniedItemIds, setDeniedItemIds] = useState<string[]>([]);

  const openReviewModal = () => {
    setReviewDecision('APPROVED');
    setReviewNote('');
    setDeniedItemIds([]);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = () => {
    // Show confirmation before submitting decision
    const decisionLabels: Record<string, string> = {
      APPROVED: 'Approve Full Claim',
      PARTIALLY_APPROVED: 'Partially Approve',
      NEEDS_REVISION: 'Request Revision',
      REJECTED: 'Reject Claim',
    };
    const decisionVariants: Record<string, 'brand' | 'warning' | 'destructive'> = {
      APPROVED: 'brand',
      PARTIALLY_APPROVED: 'brand',
      NEEDS_REVISION: 'warning',
      REJECTED: 'destructive',
    };
    setConfirmAction({
      title: `Confirm: ${decisionLabels[reviewDecision] || reviewDecision}`,
      description: `You are about to set this claim to "${reviewDecision.replace(/_/g, ' ')}". This action will be permanently logged to the Audit Trail and cannot be undone. Are you sure?`,
      confirmText: decisionLabels[reviewDecision] || 'Confirm',
      variant: decisionVariants[reviewDecision] || 'brand',
      onConfirm: () => {
        updateClaimStatus({
          claimId,
          toStatus: reviewDecision as any,
          note: reviewNote,
          deniedItemIds: reviewDecision === 'PARTIALLY_APPROVED' ? deniedItemIds : [],
        }, {
          onSuccess: () => {
            setIsReviewModalOpen(false);
            setConfirmAction(null);
          },
        });
      },
    });
  };

  // Resubmit Edit Form States
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editPatientName, setEditPatientName] = useState<string>('');
  const [editPolicyNumber, setEditPolicyNumber] = useState<string>('');
  const [editPatientDob, setEditPatientDob] = useState<string>('');
  const [editProcedureName, setEditProcedureName] = useState<string>('');
  const [editProcedureCode, setEditProcedureCode] = useState<string>('');
  const [editDateOfService, setEditDateOfService] = useState<string>('');
  const [editItems, setEditItems] = useState<Array<{ description: string; quantity: number; unitCost: number }>>([]);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editError, setEditError] = useState<string | null>(null);

  if (isLoading) {
    return <ClaimDetailsSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Claim Not Found</h2>
        <p className="text-xs text-[var(--text-muted)]">
          You don't have access to this claim or it does not exist.
        </p>
        <Link href="/provider/dashboard">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const { claim, auditTrail } = data;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleExecuteResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (editItems.length === 0) {
      setEditError('Please add at least one line item charge.');
      return;
    }

    const formData = new FormData();
    formData.append('patientName', editPatientName);
    formData.append('policyNumber', editPolicyNumber);
    formData.append('patientDob', editPatientDob);
    formData.append('procedureName', editProcedureName);
    formData.append('procedureCode', editProcedureCode);
    formData.append('dateOfService', editDateOfService);
    formData.append('items', JSON.stringify(editItems));

    editFiles.forEach((file) => {
      formData.append('documents', file);
    });

    resubmitClaim(formData, {
      onSuccess: () => {
        setIsEditing(false);
      },
      onError: (err: any) => {
        setEditError(err.response?.data?.message || 'Failed to resubmit revised claim.');
      },
    });
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 overflow-hidden pb-2">
      {/* Top Header & Alerts */}
      <div className="shrink-0 space-y-3">
        {/* Back Header Nav */}
        <div className="flex items-center justify-between">
          <Link href={backLink} className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-500)] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {userRole === 'admin' ? 'Audit Claims List' : userRole === 'reviewer' ? 'Review Queue' : 'My Claims'}</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[var(--text-muted)] hidden sm:inline">ID: {claim._id}</span>
            <StatusBadge status={claim.status} isFlagged={claim.flagged} />
            {/* Reviewer Action Button */}
            {isReviewerOrAdmin && claim.status === 'SUBMITTED' && (
              <Button
                size="sm"
                onClick={() =>
                  setConfirmAction({
                    title: 'Start Reviewing This Claim',
                    description: 'This will move the claim to "Under Review" status, locking it for your assessment. The action is logged to the Audit Trail.',
                    confirmText: 'Yes, Start Review',
                    variant: 'brand',
                    onConfirm: () => {
                      updateClaimStatus(
                        { claimId, toStatus: 'UNDER_REVIEW', note: 'Claim opened for active review' },
                        {
                          onSuccess: () => {
                            setConfirmAction(null);
                            setIsReviewModalOpen(true);
                          },
                        }
                      );
                    },
                  })
                }
                isLoading={isSubmittingReview}
                className="bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                Start Review
              </Button>
            )}
            {isReviewerOrAdmin && claim.status === 'UNDER_REVIEW' && (
              <Button
                size="sm"
                onClick={openReviewModal}
                className="bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                Submit Decision
              </Button>
            )}
            {isReviewerOrAdmin && (claim.status === 'APPROVED' || claim.status === 'PARTIALLY_APPROVED') && (
              <Button
                size="sm"
                onClick={() =>
                  setConfirmAction({
                    title: 'Mark Claim as Paid',
                    description: `You are about to finalize payment for claim #${claim._id.slice(-6).toUpperCase()} (Total: $${claim.totalClaimed.toFixed(2)}). This will mark the claim as PAID and notify the provider. This cannot be undone.`,
                    confirmText: 'Yes, Mark as Paid',
                    variant: 'brand',
                    onConfirm: () => {
                      updateClaimStatus(
                        { claimId, toStatus: 'PAID', note: 'Insurance reimbursement payment processed' },
                        { onSuccess: () => setConfirmAction(null) }
                      );
                    },
                  })
                }
                isLoading={isSubmittingReview}
                className="bg-[var(--status-approved)] hover:bg-green-800 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Banknote className="w-3.5 h-3.5" />
                Mark as Paid
              </Button>
            )}
          </div>
        </div>

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
                  {claim.flagReason || 'Total claimed amount exceeds 3x platform historical average for this procedure code.'}
                </p>
              </div>
            </div>

            {(userRole === 'admin' || pathname.startsWith('/admin')) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsUnflagConfirmOpen(true)}
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
              {claim.status === 'NEEDS_REVISION' && (
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                  onClick={() => {
                    setIsEditing(true);
                    setEditPatientName(claim.patient.name);
                    setEditPolicyNumber(claim.patient.policyNumber);
                    setEditPatientDob(new Date(claim.patient.dob).toISOString().split('T')[0]);
                    setEditProcedureName(claim.procedure.name);
                    setEditProcedureCode(claim.procedure.code);
                    setEditDateOfService(new Date(claim.procedure.dateOfService).toISOString().split('T')[0]);
                    setEditItems(
                      claim.items.map((item) => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitCost: item.unitCost,
                      }))
                    );
                  }}
                >
                  Edit & Resubmit Claim
                </Button>
              )}
            </div>
            <p className="text-xs leading-relaxed pl-6">{claim.reviewerNotes}</p>
          </div>
        )}


      </div>

      {/* Main Content Body (2-Column Responsive Layout) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left Column (Details & Charges - 2 Spans) */}
        <div className="lg:col-span-2 overflow-y-auto pr-1 space-y-6 min-h-0">
          {isEditing ? (
            <form onSubmit={handleExecuteResubmit} className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Edit & Resubmit Revised Claim</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Update patient details, procedure information, or line item charges as requested by the reviewer.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel Edit
                </Button>
              </div>

              {editError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Patient Information Inputs */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)] tracking-wider">Patient Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Patient Name</label>
                    <input
                      type="text"
                      value={editPatientName}
                      onChange={(e) => setEditPatientName(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Policy Number</label>
                    <input
                      type="text"
                      value={editPolicyNumber}
                      onChange={(e) => setEditPolicyNumber(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] font-mono focus:ring-2 focus:ring-[var(--brand-500)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editPatientDob}
                      onChange={(e) => setEditPatientDob(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)]"
                    />
                  </div>
                </div>
              </div>

              {/* Procedure Information Inputs */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)] tracking-wider">Procedure Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Procedure Name</label>
                    <input
                      type="text"
                      value={editProcedureName}
                      onChange={(e) => setEditProcedureName(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Procedure Code (CPT)</label>
                    <input
                      type="text"
                      value={editProcedureCode}
                      onChange={(e) => setEditProcedureCode(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] font-mono focus:ring-2 focus:ring-[var(--brand-500)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Date of Service</label>
                    <input
                      type="date"
                      value={editDateOfService}
                      onChange={(e) => setEditDateOfService(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)]"
                    />
                  </div>
                </div>
              </div>

              {/* Itemized Line Items Table Edit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)] tracking-wider">Itemized Line Charges</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditItems([...editItems, { description: '', quantity: 1, unitCost: 0 }])}
                    className="text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </Button>
                </div>

                <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-[var(--text-secondary)] uppercase font-semibold border-b border-[var(--border)]">
                      <tr>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                        <th className="py-2.5 px-3 w-28 text-right">Unit ($)</th>
                        <th className="py-2.5 px-3 w-28 text-right">Total</th>
                        <th className="py-2.5 px-3 w-12 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {editItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const newItems = [...editItems];
                                newItems[idx].description = e.target.value;
                                setEditItems(newItems);
                              }}
                              placeholder="Line charge description"
                              required
                              className="w-full px-2 py-1 text-xs border border-[var(--border)] rounded"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...editItems];
                                newItems[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                                setEditItems(newItems);
                              }}
                              className="w-full px-2 py-1 text-xs border border-[var(--border)] rounded text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitCost}
                              onChange={(e) => {
                                const newItems = [...editItems];
                                newItems[idx].unitCost = Math.max(0, parseFloat(e.target.value) || 0);
                                setEditItems(newItems);
                              }}
                              className="w-full px-2 py-1 text-xs border border-[var(--border)] rounded text-right font-mono"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-xs tabular-nums">
                            ${(item.quantity * item.unitCost).toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => setEditItems(editItems.filter((_, i) => i !== idx))}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attach Additional Revised Documents */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)] tracking-wider">Additional Supporting Medical Documents</h4>
                <div className="p-4 border-2 border-dashed border-[var(--border)] rounded-lg text-center space-y-2 bg-gray-50">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                  <p className="text-xs text-[var(--text-secondary)]">Attach additional PDFs or images to resolve reviewer feedback.</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setEditFiles(Array.from(e.target.files || []))}
                    className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--brand-50)] file:text-[var(--brand-700)] hover:file:bg-[var(--brand-100)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isResubmitting}
                  loadingText="Submitting Revisions..."
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Submit Revisions for Review
                </Button>
              </div>
            </form>
          ) : (
            <>
              {/* Patient & Procedure Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                    <User className="w-4 h-4 text-[var(--brand-500)]" />
                    <span>Patient Information</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Name:</span>
                      <span className="font-semibold text-[var(--text-primary)]">{claim.patient.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Policy Number:</span>
                      <span className="font-mono font-medium">{claim.patient.policyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Date of Birth:</span>
                      <span>{format(new Date(claim.patient.dob), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                    <Activity className="w-4 h-4 text-[var(--brand-500)]" />
                    <span>Procedure & Service</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Procedure Name:</span>
                      <span className="font-semibold text-[var(--text-primary)]">{claim.procedure.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Procedure Code:</span>
                      <span className="font-mono font-medium">{claim.procedure.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Date of Service:</span>
                      <span>{format(new Date(claim.procedure.dateOfService), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance Coverage & Financial Breakdown Card */}
              {['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PAID'].includes(claim.status) && (
                <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[var(--brand-500)]" />
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                        Policy Coverage & Financial Calculation Breakdown
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      Policy #{claim.patient.policyNumber} (Calendar Year {new Date(claim.procedure.dateOfService).getFullYear()})
                    </span>
                  </div>

                  {(() => {
                    const approvedTotal = claim.items.reduce((sum, item) => (item.isDenied ? sum : sum + item.quantity * item.unitCost), 0);
                    const deniedTotal = claim.items.reduce((sum, item) => (item.isDenied ? sum + item.quantity * item.unitCost : sum), 0);

                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                              Submitted Charges
                            </p>
                            <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums mt-1">
                              ${claim.totalClaimed.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                              Approved: ${approvedTotal.toFixed(2)} {deniedTotal > 0 ? `| Denied: $${deniedTotal.toFixed(2)}` : ''}
                            </p>
                          </div>

                          <div className={`p-3.5 rounded-lg border ${
                            claim.coveredAmount === 0 && approvedTotal > 0
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-blue-50 border-blue-200 text-blue-900'
                          }`}>
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-semibold uppercase tracking-wider">
                                Annual Deductible ($500)
                              </p>
                              {claim.coveredAmount === 0 && approvedTotal > 0 ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 uppercase">
                                  1st Claim (Ticket Absorbed)
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 uppercase">
                                  Deductible Satisfied
                                </span>
                              )}
                            </div>
                            <p className="text-xl font-bold tabular-nums mt-1">
                              {claim.coveredAmount === 0 && approvedTotal > 0
                                ? `$${approvedTotal.toFixed(2)} Absorbed`
                                : '$0.00 Applied'}
                            </p>
                            <p className="text-[10px] opacity-90 mt-0.5 font-medium">
                              {claim.coveredAmount === 0 && approvedTotal > 0
                                ? 'Used toward $500 yearly ticket'
                                : 'Yearly $500 ticket already 100% paid'}
                            </p>
                          </div>

                          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-900">
                              Insurer Payout (80%)
                            </p>
                            <p className="text-xl font-extrabold text-emerald-700 tabular-nums mt-1">
                              ${claim.coveredAmount.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-emerald-800 mt-0.5">
                              80% of approved amount post-deductible
                            </p>
                          </div>

                          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-900">
                              Patient Owes
                            </p>
                            <p className="text-xl font-extrabold text-amber-800 tabular-nums mt-1">
                              ${claim.patientResponsibility.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-amber-800 mt-0.5">
                              Deductible + 20% co-pay + denied charges
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Itemized Line Charges Table */}
              <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[var(--border)]">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Itemized Charges</h3>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 text-[var(--text-secondary)] uppercase font-semibold border-b border-[var(--border)]">
                    <tr>
                      <th className="py-3 px-4 text-left">Item Description</th>
                      <th className="py-3 px-4 text-left">Qty</th>
                      <th className="py-3 px-4 text-left">Unit Cost</th>
                      <th className="py-3 px-4 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {claim.items.map((item, idx) => (
                      <tr key={idx} className={`hover:bg-gray-50 ${item.isDenied ? 'bg-red-50/50' : ''}`}>
                        <td className="py-3 px-4 font-medium text-[var(--text-primary)] text-left">
                          <div className="flex items-center gap-2">
                            <span>{item.description}</span>
                            {['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PAID'].includes(claim.status) && (
                              item.isDenied ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                                  Denied
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                                  Approved
                                </span>
                              )
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-left">{item.quantity}</td>
                        <td className="py-3 px-4 text-left tabular-nums">${item.unitCost.toFixed(2)}</td>
                        <td className="py-3 px-4 text-left font-bold tabular-nums">${(item.quantity * item.unitCost).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 bg-[var(--brand-50)] border-t border-[var(--border)] flex justify-between items-center text-sm font-bold">
                  <span className="text-[var(--brand-700)]">Total Claimed Amount:</span>
                  <span className="text-[var(--brand-600)] tabular-nums text-lg">${claim.totalClaimed.toFixed(2)}</span>
                </div>
              </div>

              {/* Supporting Documents Section */}
              <div className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs space-y-3">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                  Supporting Documents ({claim.documents.length})
                </h3>
                {claim.documents.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">No supporting documents attached.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {claim.documents.map((doc) => {
                      const downloadUrl = `${apiBase}/claims/${claim._id}/documents/${doc.filename}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
                      return (
                        <div
                          key={doc._id}
                          className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-gray-50 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-[var(--brand-500)] shrink-0" />
                            <span className="font-medium text-[var(--text-primary)] truncate">{doc.originalName}</span>
                          </div>
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-500)] hover:underline shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Column (Dedicated Side Audit Trail Panel - 1 Span) */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs flex flex-col min-h-0 overflow-hidden">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-3 shrink-0 flex items-center justify-between">
            <span>Audit Trail History</span>
            <span className="text-xs font-semibold bg-[var(--brand-50)] text-[var(--brand-700)] px-2 py-0.5 rounded-full">
              {auditTrail.length} Events
            </span>
          </h3>

          <div className="mt-3 flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
            {auditTrail.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-4 text-center">No audit logs recorded.</p>
            ) : (
              auditTrail.map((log) => (
                <div key={log._id} className="flex items-start gap-2.5 text-xs p-3 rounded-lg bg-gray-50 border border-[var(--border)]">
                  <Clock className="w-4 h-4 text-[var(--brand-500)] shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="font-semibold text-[var(--text-primary)] truncate">
                        {log.action}
                      </span>
                      <StatusBadge status={log.toStatus} />
                    </div>
                    <p className="text-[var(--text-secondary)] text-[11px] leading-snug">{log.note || 'No notes attached'}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)]">
                      <span>By: {log.performedBy?.name || 'System'}</span>
                      <span>{format(new Date(log.timestamp), 'MMM dd, HH:mm')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Clear Fraud Flag Confirmation Modal */}
      <ConfirmDialog
        isOpen={isUnflagConfirmOpen}
        title={`Clear Fraud Flag on Claim #${claim._id.slice(-6).toUpperCase()}`}
        description="Are you sure you want to remove the fraud flag from this claim? The claim status will return to normal state."
        confirmText="Clear Fraud Flag"
        variant="default"
        isLoading={isUnflagging}
        onConfirm={() => {
          unflagClaim(claim._id, {
            onSuccess: () => {
              setIsUnflagConfirmOpen(false);
            },
          });
        }}
        onClose={() => setIsUnflagConfirmOpen(false)}
      />

      {/* ── Reviewer Decision Modal ── */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsReviewModalOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--brand-50)] flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4 text-[var(--brand-500)]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">Submit Review Decision</h2>
                  <p className="text-[11px] text-[var(--text-muted)]">Claim #{claim._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
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
                    { id: 'APPROVED', label: '✓ Approve', desc: 'Approve full claim', activeClass: 'bg-[var(--status-approved)] border-[var(--status-approved)] text-white' },
                    { id: 'PARTIALLY_APPROVED', label: '◑ Partial', desc: 'Approve some items', activeClass: 'bg-[var(--brand-500)] border-[var(--brand-500)] text-white' },
                    { id: 'NEEDS_REVISION', label: '↩ Revision', desc: 'Request corrections', activeClass: 'bg-amber-500 border-amber-500 text-white' },
                    { id: 'REJECTED', label: '✕ Reject', desc: 'Deny this claim', activeClass: 'bg-[var(--status-rejected)] border-[var(--status-rejected)] text-white' },
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
                      <div className={`text-sm font-bold ${reviewDecision === opt.id ? 'text-inherit' : 'text-[var(--text-primary)]'}`}>{opt.label}</div>
                      <div className={`text-[11px] mt-0.5 ${reviewDecision === opt.id ? 'opacity-80' : 'text-[var(--text-muted)]'}`}>{opt.desc}</div>
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
                            isDenied ? 'bg-red-50 text-red-700' : 'bg-white text-[var(--text-secondary)] hover:bg-gray-50'
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
                            <span className={isDenied ? 'line-through opacity-60' : ''}>{item.description}</span>
                          </div>
                          <span className="font-mono font-semibold">${(item.quantity * item.unitCost).toFixed(2)}</span>
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
                    reviewDecision === 'APPROVED' ? 'Optional — any notes for this approval...'
                    : reviewDecision === 'PARTIALLY_APPROVED' ? 'Explain which items were denied and why...'
                    : reviewDecision === 'NEEDS_REVISION' ? 'Describe what corrections the provider must make...'
                    : 'Provide reason for rejection...'
                  }
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] focus:border-[var(--brand-500)] resize-none"
                />
              </div>

              {/* Coverage Preview (approve/partial only) */}
              {(reviewDecision === 'APPROVED' || reviewDecision === 'PARTIALLY_APPROVED') && (() => {
                const activeSum = claim.items.reduce((sum, item, idx) => {
                  const itemId = item._id || String(idx);
                  if (reviewDecision === 'PARTIALLY_APPROVED' && deniedItemIds.includes(itemId)) return sum;
                  return sum + (item.quantity * item.unitCost);
                }, 0);
                const deductible = Math.min(500, activeSum);
                const estCovered = Math.max(0, activeSum - deductible) * 0.8;
                const estPatient = claim.totalClaimed - estCovered;
                return (
                  <div className="bg-[var(--brand-50)] rounded-xl border border-[var(--brand-500)]/25 p-3">
                    <p className="text-[10px] font-semibold text-[var(--brand-700)] uppercase tracking-wider mb-2">Coverage Preview · $500 Ded. + 80% Co-Ins.</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white border border-[var(--border)] rounded-lg p-2">
                        <div className="text-[10px] text-[var(--text-muted)]">Claimed</div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">${claim.totalClaimed.toFixed(2)}</div>
                      </div>
                      <div className="bg-[var(--status-approved-bg)] border border-[var(--status-approved)]/30 rounded-lg p-2">
                        <div className="text-[10px] text-[var(--status-approved)] font-semibold">Insurance</div>
                        <div className="text-sm font-bold text-[var(--status-approved)]">${estCovered.toFixed(2)}</div>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                        <div className="text-[10px] text-amber-700 font-semibold">Patient</div>
                        <div className="text-sm font-bold text-amber-700">${estPatient.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-[var(--border)] flex items-center justify-between gap-3">
              <p className="text-[11px] text-[var(--text-muted)]">Decision is logged to the Audit Trail.</p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReviewSubmit}
                  isLoading={isSubmittingReview}
                  className="bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-xs font-semibold px-5"
                >
                  Confirm Decision
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Shared Reviewer Action Confirmation Dialog */}
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
    </div>
  );
}
