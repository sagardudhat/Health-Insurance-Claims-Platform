import React, { useState } from 'react';
import { Claim } from '@/features/claims/types';
import { useResubmitClaim } from '@/features/claims/hooks';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus, Trash2, Upload } from 'lucide-react';

interface ClaimEditFormProps {
  claim: Claim;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ClaimEditForm: React.FC<ClaimEditFormProps> = ({ claim, onCancel, onSuccess }) => {
  const { mutate: resubmitClaim, isPending: isResubmitting } = useResubmitClaim(claim._id);

  const [editPatientName, setEditPatientName] = useState<string>(claim.patient.name);
  const [editPolicyNumber, setEditPolicyNumber] = useState<string>(claim.patient.policyNumber);
  const [editPatientDob, setEditPatientDob] = useState<string>(
    new Date(claim.patient.dob).toISOString().split('T')[0]
  );
  const [editProcedureName, setEditProcedureName] = useState<string>(claim.procedure.name);
  const [editProcedureCode, setEditProcedureCode] = useState<string>(claim.procedure.code);
  const [editDateOfService, setEditDateOfService] = useState<string>(
    new Date(claim.procedure.dateOfService).toISOString().split('T')[0]
  );
  const [editItems, setEditItems] = useState<
    Array<{ description: string; quantity: number; unitCost: number }>
  >(
    claim.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitCost: item.unitCost,
    }))
  );
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editError, setEditError] = useState<string | null>(null);

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
      onSuccess,
      onError: (err: any) => {
        setEditError(err.response?.data?.message || 'Failed to resubmit revised claim.');
      },
    });
  };

  return (
    <form
      onSubmit={handleExecuteResubmit}
      className="bg-white p-6 rounded-xl border-2 border-amber-300 shadow-md space-y-6"
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Edit & Resubmit Revised Claim
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Update patient details, procedure information, or line item charges as requested by the
            reviewer.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
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
        <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)] tracking-wider">
          Patient Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Patient Name
            </label>
            <input
              type="text"
              value={editPatientName}
              onChange={(e) => setEditPatientName(e.target.value)}
              required
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Policy Number
            </label>
            <input
              type="text"
              value={editPolicyNumber}
              onChange={(e) => setEditPolicyNumber(e.target.value)}
              required
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] font-mono focus:ring-2 focus:ring-[var(--brand-500)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Date of Birth
            </label>
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
        <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)] tracking-wider">
          Procedure Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Procedure Name
            </label>
            <input
              type="text"
              value={editProcedureName}
              onChange={(e) => setEditProcedureName(e.target.value)}
              required
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Procedure Code (CPT)
            </label>
            <input
              type="text"
              value={editProcedureCode}
              onChange={(e) => setEditProcedureCode(e.target.value)}
              required
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] font-mono focus:ring-2 focus:ring-[var(--brand-500)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Date of Service
            </label>
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
          <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)] tracking-wider">
            Itemized Line Charges
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setEditItems([...editItems, { description: '', quantity: 1, unitCost: 0 }])
            }
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
        <h4 className="text-xs font-semibold uppercase text-[var(--text-secondary)] tracking-wider">
          Additional Supporting Medical Documents
        </h4>
        <div className="p-4 border-2 border-dashed border-[var(--border)] rounded-lg text-center space-y-2 bg-gray-50">
          <Upload className="w-6 h-6 text-gray-400 mx-auto" />
          <p className="text-xs text-[var(--text-secondary)]">
            Attach additional PDFs or images to resolve reviewer feedback.
          </p>
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
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
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
  );
};
