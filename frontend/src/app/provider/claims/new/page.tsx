'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateClaim } from '@/features/claims/hooks';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Trash2,
  Upload,
  UploadCloud,
  FileText,
  User,
  Calendar,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const todayStr = new Date().toISOString().split('T')[0];

const formSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  policyNumber: z.string().min(3, 'Policy number is required'),
  patientDob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((val) => new Date(val) <= new Date(), 'Patient Date of Birth cannot be in the future'),
  procedureName: z.string().min(2, 'Procedure name is required'),
  procedureCode: z.string().min(2, 'Procedure code is required'),
  dateOfService: z
    .string()
    .min(1, 'Date of service is required')
    .refine((val) => new Date(val) <= new Date(), 'Date of Service cannot be in the future'),
  items: z
    .array(
      z.object({
        description: z.string().min(2, 'Item description is required'),
        quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
        unitCost: z.coerce.number().min(0.01, 'Unit cost must be greater than $0'),
      })
    )
    .min(1, 'At least one itemized charge is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewClaimPage() {
  const { mutate: createClaim, isPending, error: submitError } = useCreateClaim();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      policyNumber: '',
      patientDob: '',
      procedureName: '',
      procedureCode: '',
      dateOfService: '',
      items: [{ description: '', quantity: 1, unitCost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items') || [];
  const totalClaimed = watchedItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const cost = Number(item.unitCost) || 0;
    return sum + qty * cost;
  }, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // File validation: PDF/JPEG/PNG, max 5MB
      const invalidType = filesArray.find(
        (f) => !['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(f.type)
      );
      if (invalidType) {
        setFileError('Invalid file format. Only PDF, JPEG, and PNG files are allowed.');
        return;
      }

      const invalidSize = filesArray.find((f) => f.size > 5 * 1024 * 1024);
      if (invalidSize) {
        setFileError('File size exceeds 5MB limit.');
        return;
      }

      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormValues) => {
    setFileError(null);
    if (selectedFiles.length === 0) {
      setFileError('At least one supporting medical document (PDF, PNG, JPG) is mandatory.');
      return;
    }

    const formData = new FormData();
    formData.append('patientName', data.patientName);
    formData.append('policyNumber', data.policyNumber);
    formData.append('patientDob', data.patientDob);
    formData.append('procedureName', data.procedureName);
    formData.append('procedureCode', data.procedureCode);
    formData.append('dateOfService', data.dateOfService);
    formData.append('items', JSON.stringify(data.items));

    selectedFiles.forEach((file) => {
      formData.append('documents', file);
    });

    createClaim(formData);
  };

  const serverError =
    (submitError as any)?.response?.data?.message ||
    (submitError ? 'Failed to submit claim. Please review input fields.' : null);

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col min-h-0 space-y-4 overflow-hidden">
      {/* Fixed Sticky Header Banner */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Submit New Insurance Claim
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Enter patient details, treatment procedures, itemized charges, and upload supporting
          medical bills.
        </p>
      </div>

      {serverError && (
        <div className="shrink-0 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Main Form Area */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        {/* Scrollable Form Body Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 min-h-0 pb-2">
          {/* Patient Details Card */}
          <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <User className="w-5 h-5 text-[var(--brand-500)]" />
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                1. Patient Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Patient Full Name *
                </label>
                <input
                  {...register('patientName')}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
                />
                {errors.patientName && (
                  <p className="text-xs text-red-600">{errors.patientName.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Policy Number *
                </label>
                <input
                  {...register('policyNumber')}
                  placeholder="e.g. POL-992014"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
                />
                {errors.policyNumber && (
                  <p className="text-xs text-red-600">{errors.policyNumber.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Date of Birth *
                </label>
                <input
                  {...register('patientDob')}
                  type="date"
                  max={todayStr}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
                />
                {errors.patientDob && (
                  <p className="text-xs text-red-600">{errors.patientDob.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Treatment & Procedure Details */}
          <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Activity className="w-5 h-5 text-[var(--brand-500)]" />
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                2. Procedure & Treatment
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Procedure Name *
                </label>
                <input
                  {...register('procedureName')}
                  placeholder="e.g. MRI Knee Scan"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
                />
                {errors.procedureName && (
                  <p className="text-xs text-red-600">{errors.procedureName.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Procedure Code (CPT) *
                </label>
                <input
                  {...register('procedureCode')}
                  placeholder="e.g. CPT-73721"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
                />
                {errors.procedureCode && (
                  <p className="text-xs text-red-600">{errors.procedureCode.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Date of Service *
                </label>
                <input
                  {...register('dateOfService')}
                  type="date"
                  max={todayStr}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
                />
                {errors.dateOfService && (
                  <p className="text-xs text-red-600">{errors.dateOfService.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[var(--brand-500)]" />
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  3. Itemized Charges
                </h2>
              </div>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unitCost: 0 })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--brand-700)] bg-[var(--brand-50)] hover:bg-[var(--brand-100)] rounded-lg transition-colors border border-blue-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Charge Line</span>
              </button>
            </div>

            {fields.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] text-center py-4">
                No line charges added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {fields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className="grid grid-cols-12 gap-3 items-end p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]"
                  >
                    <div className="col-span-5 space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Description *
                      </label>
                      <input
                        {...register(`items.${index}.description`)}
                        placeholder="Line item charge..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-white"
                      />
                    </div>

                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Qty *
                      </label>
                      <input
                        type="number"
                        min="1"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-[var(--border)] text-center bg-white"
                      />
                    </div>

                    <div className="col-span-3 space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Unit Cost ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-right font-mono bg-white"
                      />
                    </div>

                    <div className="col-span-2 flex items-center justify-between pb-1 pl-2">
                      <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">
                        $
                        {(
                          (watchedItems?.[index]?.quantity || 0) *
                          (watchedItems?.[index]?.unitCost || 0)
                        ).toFixed(2)}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center text-sm font-bold">
              <span className="text-[var(--text-secondary)]">Total Estimated Claimed:</span>
              <span className="text-xl text-[var(--brand-700)] tabular-nums">
                ${totalClaimed.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Supporting Medical Documents Section */}
          <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Upload className="w-5 h-5 text-[var(--brand-500)]" />
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                4. Mandatory Supporting Documents
              </h2>
            </div>

            {fileError && <p className="text-xs text-red-600 font-medium">{fileError}</p>}

            <div className="border-2 border-dashed border-[var(--border)] hover:border-[var(--brand-500)] rounded-xl p-6 text-center bg-gray-50/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-[var(--brand-500)] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                Click to upload or drag & drop medical bills or prescription PDF/images
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                PDF, PNG, or JPEG format (Max 5MB each)
              </p>
            </div>

            {/* Selected File List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs font-semibold text-[var(--text-secondary)]">
                  Attached Files ({selectedFiles.length}):
                </p>
                <div className="space-y-1.5">
                  {selectedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-[var(--brand-500)] shrink-0" />
                        <span className="font-medium text-[var(--text-primary)] truncate">
                          {file.name}
                        </span>
                        <span className="text-[var(--text-muted)]">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Sticky Footer Action Bar */}
        <div className="shrink-0 bg-white p-4 rounded-xl border border-[var(--border)] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 mt-2">
          <div className="text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">Ready for Submission?</span>{' '}
            Ensure patient details & medical document attachments are accurate.
          </div>
          <Button
            type="submit"
            size="lg"
            isLoading={isPending}
            loadingText="Submitting Insurance Claim..."
            className="w-full md:w-auto px-8 font-semibold text-xs"
          >
            <span>Submit Claim to Review Queue</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
