import { z } from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(2, 'Description must be at least 2 characters'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative'),
});

export const createClaimSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  policyNumber: z.string().min(3, 'Policy number is required'),
  patientDob: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Valid DOB is required')
    .refine((val) => new Date(val) <= new Date(), 'Patient Date of Birth cannot be in the future'),
  procedureName: z.string().min(2, 'Procedure name is required'),
  procedureCode: z.string().min(2, 'Procedure code is required'),
  dateOfService: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Valid date of service is required')
    .refine((val) => new Date(val) <= new Date(), 'Date of Service cannot be in the future'),
  items: z
    .array(lineItemSchema)
    .min(1, 'At least one line item is required'),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
