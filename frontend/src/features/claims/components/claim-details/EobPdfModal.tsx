'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Claim, AuditLogEntry } from '@/features/claims/types';
import { Button } from '@/components/ui/button';
import { Printer, X, FileText, ShieldCheck } from 'lucide-react';

interface EobPdfModalProps {
  claim: Claim;
  auditTrail: AuditLogEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export const EobPdfModal: React.FC<EobPdfModalProps> = ({ claim, isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalBilled = claim.totalClaimed || 0;
  const coveredAmount = claim.coveredAmount || 0;
  const patientResp = claim.patientResponsibility || 0;
  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const modalContent = (
    <div
      id="eob-portal-root"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto print:static print:bg-white print:p-0 print:m-0 print:overflow-visible print:block print:w-full"
    >
      {/* Dynamic Print CSS: Completely hides background app and prints ONLY this EOB */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body > *:not(#eob-portal-root) {
                display: none !important;
              }
              #eob-portal-root {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                display: block !important;
              }
              .eob-no-print {
                display: none !important;
              }
              .eob-[90vh] {
                max-height: none !important;
                border: none !important;
                box-shadow: none !important;
                width: 100% !important;
              }
            }
          `,
        }}
      />

      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden eob-[90vh] print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none print:p-0">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0 eob-no-print print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--brand-600)]" />
            <h2 className="text-base font-bold text-gray-900">
              Explanation of Benefits (EOB) Preview
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-xs gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* EOB Statement Document Body (Identical in Preview and Print) */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 text-gray-800 text-sm bg-white print:p-0 print:overflow-visible print:block">
          {/* Header Banner */}
          <div className="flex items-start justify-between border-b-2 border-gray-900 pb-6">
            <div>
              <div className="flex items-center gap-2 text-[var(--brand-700)] font-black text-xl tracking-tight">
                <ShieldCheck className="w-7 h-7" />
                <span>CLAIMCARE HEALTH PLAN</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Official Explanation of Benefits (EOB) Statement
              </p>
              <p className="text-xs text-gray-500">
                100 Health Plaza Suite 400, Financial District
              </p>
            </div>
            <div className="text-right space-y-1">
              <span className="inline-block px-3 py-1 bg-gray-100 border border-gray-300 font-mono text-xs font-bold text-gray-700 rounded-md">
                STATEMENT ID: EOB-{claim._id.slice(-8).toUpperCase()}
              </span>
              <p className="text-xs text-gray-500">
                Issue Date: <span className="font-semibold text-gray-700">{issueDate}</span>
              </p>
              <p className="text-xs text-gray-500">
                Claim Reference:{' '}
                <span className="font-semibold font-mono text-gray-800">
                  #{claim._id.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          {/* Member & Claim Header Grid */}
          <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200 print:bg-gray-50">
            <div className="space-y-1">
              <h4 className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                Patient & Member Information
              </h4>
              <p className="font-bold text-gray-900 text-base">{claim.patient?.name || 'N/A'}</p>
              <p className="text-xs text-gray-600">
                Policy Number:{' '}
                <span className="font-mono font-semibold text-gray-800">
                  {claim.patient?.policyNumber || 'N/A'}
                </span>
              </p>
              <p className="text-xs text-gray-600">
                Date of Birth:{' '}
                {claim.patient?.dob ? new Date(claim.patient.dob).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                Provider & Treatment Information
              </h4>
              <p className="font-bold text-gray-900 text-base">
                {claim.submittedBy?.name || 'Healthcare Provider'}
              </p>
              <p className="text-xs text-gray-600">
                Procedure:{' '}
                <span className="font-semibold text-gray-800">
                  {claim.procedure?.name} ({claim.procedure?.code})
                </span>
              </p>
              <p className="text-xs text-gray-600">
                Date of Service:{' '}
                {claim.procedure?.dateOfService
                  ? new Date(claim.procedure.dateOfService).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Billed Charges</p>
              <p className="text-2xl font-bold text-gray-900 mt-1 font-mono">
                ${totalBilled.toFixed(2)}
              </p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
              <p className="text-xs font-semibold text-emerald-700 uppercase">
                Plan Covered Payout
              </p>
              <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
                ${coveredAmount.toFixed(2)}
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
              <p className="text-xs font-semibold text-amber-800 uppercase">
                Patient Responsibility
              </p>
              <p className="text-2xl font-bold text-amber-800 mt-1 font-mono">
                ${patientResp.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Itemized Services Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              Itemized Service Breakdown
            </h3>
            <table className="w-full text-left border-collapse border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-bold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Service Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Cost</th>
                  <th className="py-2.5 px-3 text-right">Total Billed</th>
                  <th className="py-2.5 px-3 text-center">Adjudication Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
                {(claim.items || []).map((item, idx) => {
                  const lineTotal = (item.quantity || 0) * (item.unitCost || 0);
                  return (
                    <tr key={idx} className={item.isDenied ? 'bg-red-50/50' : ''}>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{item.description}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        ${(item.unitCost || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-gray-900">
                        ${lineTotal.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold">
                        {item.isDenied ? (
                          <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px]">
                            Denied / Excluded
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px]">
                            Eligible & Covered
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Remarks & Adjudication Notes */}
          {claim.reviewerNotes && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Reviewer Adjudication Remarks
              </h4>
              <p className="text-xs text-gray-600 italic">&quot;{claim.reviewerNotes}&quot;</p>
            </div>
          )}

          {/* Legal / Appeals Notice Footer */}
          <div className="pt-4 border-t border-gray-200 text-[11px] text-gray-400 space-y-1">
            <p className="font-semibold text-gray-500">THIS IS NOT A BILL.</p>
            <p>
              This Explanation of Benefits (EOB) summarizes the processing of your insurance claim
              in accordance with your plan guidelines. If you have questions regarding denied line
              items or coinsurance amounts, you have the right to file an appeal within 180 days of
              this statement date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
