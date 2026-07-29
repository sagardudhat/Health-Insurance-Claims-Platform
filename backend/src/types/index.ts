// Types layer: Domain-wide shared TypeScript interfaces, type definitions, and enums.
export type UserRole = 'provider' | 'reviewer' | 'admin';
export type UserStatus = 'active' | 'suspended';

export type ClaimStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED'
  | 'NEEDS_REVISION'
  | 'PAID';
