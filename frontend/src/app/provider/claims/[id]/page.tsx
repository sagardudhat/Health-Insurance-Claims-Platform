'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useClaimDetails, useResubmitClaim } from '@/features/claims/hooks';
import { useAuthStore } from '@/features/auth/store';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
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
  Upload
} from 'lucide-react';
import { format } from 'date-fns';

export default function ClaimDetailsPage() {
  const params = useParams();
  const claimId = params.id as string;
  const { data, isLoading, isError } = useClaimDetails(claimId);
  const { mutate: resubmitClaim, isPending: isResubmitting } = useResubmitClaim(claimId);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const backLink = role === 'admin' ? '/admin/claims' : role === 'reviewer' ? '/reviewer/dashboard' : '/provider/dashboard';

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
    <div className="max-w-5xl mx-auto h-full overflow-y-auto pr-1 space-y-6 pb-12">
      {/* Back Header Nav */}
      <div className="flex items-center justify-between">
        <Link href={backLink} className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-500)] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {role === 'admin' ? 'Audit Claims List' : 'Dashboard'}</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--text-muted)]">ID: {claim._id}</span>
          <StatusBadge status={claim.status} isFlagged={claim.flagged} />
        </div>
      </div>

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
                  // Initialize form fields with existing claim data
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

      {/* Inline Interactive Edit & Resubmit Form Mode */}
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

          {/* Patient Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Patient Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text-secondary)] mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={editPatientName}
                  onChange={(e) => setEditPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)]"
                />
              </div>
              <div>
                <label className="block font-medium text-[var(--text-secondary)] mb-1">Policy Number *</label>
                <input
                  type="text"
                  required
                  value={editPolicyNumber}
                  onChange={(e) => setEditPolicyNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-[var(--text-secondary)] mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={editPatientDob}
                  onChange={(e) => setEditPatientDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)]"
                />
              </div>
            </div>
          </div>

          {/* Procedure Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Procedure & Service</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text-secondary)] mb-1">Procedure Name *</label>
                <input
                  type="text"
                  required
                  value={editProcedureName}
                  onChange={(e) => setEditProcedureName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)]"
                />
              </div>
              <div>
                <label className="block font-medium text-[var(--text-secondary)] mb-1">Procedure Code *</label>
                <input
                  type="text"
                  required
                  value={editProcedureCode}
                  onChange={(e) => setEditProcedureCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-[var(--text-secondary)] mb-1">Date of Service *</label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={editDateOfService}
                  onChange={(e) => setEditDateOfService(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)]"
                />
              </div>
            </div>
          </div>

          {/* Line Item Charges */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Itemized Charges</h4>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditItems([...editItems, { description: '', quantity: 1, unitCost: 0 }])}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Line Item
              </Button>
            </div>

            <div className="space-y-2">
              {editItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-[var(--border)] text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...editItems];
                      updated[idx].description = e.target.value;
                      setEditItems(updated);
                    }}
                    className="flex-1 px-2.5 py-1.5 rounded border border-[var(--border)] bg-white"
                  />
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...editItems];
                      updated[idx].quantity = Number(e.target.value);
                      setEditItems(updated);
                    }}
                    className="w-16 px-2 py-1.5 rounded border border-[var(--border)] bg-white text-center"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="Unit Cost ($)"
                    value={item.unitCost}
                    onChange={(e) => {
                      const updated = [...editItems];
                      updated[idx].unitCost = Number(e.target.value);
                      setEditItems(updated);
                    }}
                    className="w-24 px-2 py-1.5 rounded border border-[var(--border)] bg-white text-right font-mono"
                  />
                  <span className="w-20 text-right font-bold tabular-nums">
                    ${(item.quantity * item.unitCost).toFixed(2)}
                  </span>
                  {editItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setEditItems(editItems.filter((_, i) => i !== idx))}
                      className="p-1.5 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Attach Additional Documents */}
          <div className="space-y-2 text-xs">
            <label className="block font-medium text-[var(--text-secondary)]">Attach Additional Documents (Optional)</label>
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files) {
                  setEditFiles(Array.from(e.target.files));
                }
              }}
              className="w-full text-xs text-[var(--text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
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
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-3">
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

        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-3">
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
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
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
        <div className="p-5 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Itemized Charges</h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--bg)] text-[var(--text-secondary)] uppercase font-semibold border-b border-[var(--border)]">
            <tr>
              <th className="py-3 px-4">Item Description</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4 text-right">Unit Cost</th>
              <th className="py-3 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {claim.items.map((item, idx) => (
              <tr key={idx} className={`hover:bg-gray-50 ${item.isDenied ? 'bg-red-50/50' : ''}`}>
                <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
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
                <td className="py-3 px-4 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-right tabular-nums">${item.unitCost.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-bold tabular-nums">${(item.quantity * item.unitCost).toFixed(2)}</td>
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
      <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
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

      {/* Basic Audit Log List */}
      <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
          Audit Trail History ({auditTrail.length})
        </h3>
        <div className="space-y-3">
          {auditTrail.map((log) => (
            <div key={log._id} className="flex items-start gap-3 text-xs p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
              <Clock className="w-4 h-4 text-[var(--brand-500)] shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {log.action} — <StatusBadge status={log.toStatus} />
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)]">{log.note || 'No notes attached'}</p>
                <p className="text-[10px] text-[var(--text-muted)] font-medium">
                  By: {log.performedBy?.name || 'System'} ({log.role})
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
