// Configuration constants: Roles, state machine allowed transitions, policy rules, and system defaults.
export const USER_ROLES = {
  PROVIDER: 'provider',
  REVIEWER: 'reviewer',
  ADMIN: 'admin',
} as const;

export const ROLE_LABELS = {
  [USER_ROLES.PROVIDER]: 'Healthcare Provider',
  [USER_ROLES.REVIEWER]: 'Claims Reviewer',
  [USER_ROLES.ADMIN]: 'Platform Administrator',
} as const;

export const CLAIM_STATUSES = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  PARTIALLY_APPROVED: 'PARTIALLY_APPROVED',
  REJECTED: 'REJECTED',
  NEEDS_REVISION: 'NEEDS_REVISION',
  PAID: 'PAID',
} as const;

export const POLICY_RULES = {
  ANNUAL_LIMIT: 10000,
  DEDUCTIBLE: 500,
  COVERAGE_RATE: 0.8,
} as const;
