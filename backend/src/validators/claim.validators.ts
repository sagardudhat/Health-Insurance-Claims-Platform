import { z } from 'zod';

import { CLAIM_STATUSES } from '../config/constants';

// ── Whitelist of valid claim status values ────────────────────────────────────
export const VALID_STATUSES = [
  CLAIM_STATUSES.SUBMITTED,
  CLAIM_STATUSES.UNDER_REVIEW,
  CLAIM_STATUSES.APPROVED,
  CLAIM_STATUSES.PARTIALLY_APPROVED,
  CLAIM_STATUSES.REJECTED,
  CLAIM_STATUSES.NEEDS_REVISION,
  CLAIM_STATUSES.PAID,
] as const;

// ── Whitelist of searchable fields ────────────────────────────────────────────
export const ALLOWED_SEARCH_FIELDS = [
  'all',
  'patientName',
  'policyNumber',
  'procedureName',
  'procedureCode',
] as const;

// ── Line item schema with strict upper bounds ─────────────────────────────────
export const lineItemSchema = z.object({
  description: z
    .string()
    .min(2, 'Description must be at least 2 characters')
    .max(255, 'Description cannot exceed 255 characters')
    .trim(),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(9999, 'Quantity cannot exceed 9999'),
  unitCost: z
    .number({ invalid_type_error: 'Unit cost must be a number' })
    .min(0.01, 'Unit cost must be greater than zero')
    .max(99999, 'Unit cost cannot exceed $99,999 per item'),
});

// ── Claim creation schema ─────────────────────────────────────────────────────
export const createClaimSchema = z.object({
  patientName: z
    .string()
    .min(2, 'Patient name is required')
    .max(150, 'Patient name too long')
    .trim(),
  policyNumber: z
    .string()
    .min(3, 'Policy number is required')
    .max(50, 'Policy number too long')
    .trim(),
  patientDob: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Valid DOB is required')
    .refine((val) => new Date(val) <= new Date(), 'Patient Date of Birth cannot be in the future'),
  procedureName: z
    .string()
    .min(2, 'Procedure name is required')
    .max(200, 'Procedure name too long')
    .trim(),
  procedureCode: z
    .string()
    .min(2, 'Procedure code is required')
    .max(30, 'Procedure code too long')
    .trim(),
  dateOfService: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Valid date of service is required')
    .refine((val) => new Date(val) <= new Date(), 'Date of Service cannot be in the future'),
  items: z
    .array(lineItemSchema)
    .min(1, 'At least one line item is required')
    .max(50, 'Cannot have more than 50 line items per claim'),
});

// ── Status transition schema (for reviewer PATCH endpoint) ────────────────────
// The server enforces the actual state machine — this catches obviously bad input first.
export const statusTransitionSchema = z.object({
  toStatus: z.enum(VALID_STATUSES, {
    errorMap: () => ({
      message: `Invalid target status. Must be one of: ${VALID_STATUSES.join(', ')}`,
    }),
  }),
  note: z.string().max(2000, 'Reviewer note cannot exceed 2000 characters').optional(),
  deniedItemIds: z
    .array(z.string().min(1))
    .max(50, 'Cannot deny more than 50 items')
    .optional()
    .default([]),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type StatusTransitionInput = z.infer<typeof statusTransitionSchema>;
