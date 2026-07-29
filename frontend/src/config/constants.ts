// Centralized frontend domain constants: User roles, role display labels, dashboard routes, and status maps.
export const USER_ROLES = {
  PROVIDER: 'provider',
  REVIEWER: 'reviewer',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.PROVIDER]: 'Healthcare Provider',
  [USER_ROLES.REVIEWER]: 'Claims Reviewer',
  [USER_ROLES.ADMIN]: 'Platform Administrator',
} as const;

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  [USER_ROLES.PROVIDER]: '/provider/dashboard',
  [USER_ROLES.REVIEWER]: '/reviewer/dashboard',
  [USER_ROLES.ADMIN]: '/admin/dashboard',
} as const;
