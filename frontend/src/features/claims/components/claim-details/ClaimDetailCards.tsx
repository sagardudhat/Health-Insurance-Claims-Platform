import React from 'react';
import { format } from 'date-fns';
import { User, Activity, DollarSign, FileText, Download } from 'lucide-react';
import { Claim } from '@/features/claims/types';

interface ClaimDetailCardsProps {
  claim: Claim;
  token?: string | null;
}

export const ClaimDetailCards: React.FC<ClaimDetailCardsProps> = ({ claim, token }) => {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  return (
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
              <span className="font-semibold text-[var(--text-primary)]">
                {claim.procedure.name}
              </span>
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
              Policy #{claim.patient.policyNumber} (Calendar Year{' '}
              {new Date(claim.procedure.dateOfService).getFullYear()})
            </span>
          </div>

          {(() => {
            const approvedTotal = claim.items.reduce(
              (sum, item) => (item.isDenied ? sum : sum + item.quantity * item.unitCost),
              0
            );
            const deniedTotal = claim.items.reduce(
              (sum, item) => (item.isDenied ? sum + item.quantity * item.unitCost : sum),
              0
            );

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
                      Approved: ${approvedTotal.toFixed(2)}{' '}
                      {deniedTotal > 0 ? `| Denied: $${deniedTotal.toFixed(2)}` : ''}
                    </p>
                  </div>

                  <div
                    className={`p-3.5 rounded-lg border ${
                      claim.coveredAmount === 0 && approvedTotal > 0
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-blue-50 border-blue-200 text-blue-900'
                    }`}
                  >
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
                    {['APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PAID'].includes(
                      claim.status
                    ) &&
                      (item.isDenied ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                          Denied
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                          Approved
                        </span>
                      ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-left">{item.quantity}</td>
                <td className="py-3 px-4 text-left tabular-nums">${item.unitCost.toFixed(2)}</td>
                <td className="py-3 px-4 text-left font-bold tabular-nums">
                  ${(item.quantity * item.unitCost).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-[var(--brand-50)] border-t border-[var(--border)] flex justify-between items-center text-sm font-bold">
          <span className="text-[var(--brand-700)]">Total Claimed Amount:</span>
          <span className="text-[var(--brand-600)] tabular-nums text-lg">
            ${claim.totalClaimed.toFixed(2)}
          </span>
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
              const downloadUrl = `${apiBase}/claims/${claim._id}/documents/${doc.filename}${
                token ? `?token=${encodeURIComponent(token)}` : ''
              }`;
              return (
                <div
                  key={doc._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-gray-50 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[var(--brand-500)] shrink-0" />
                    <span className="font-medium text-[var(--text-primary)] truncate">
                      {doc.originalName}
                    </span>
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
  );
};
