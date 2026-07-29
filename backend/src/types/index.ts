// Types layer: Domain-wide shared TypeScript interfaces, type definitions, and enums.
import { USER_ROLES, CLAIM_STATUSES } from '../config/constants';

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type UserStatus = 'active' | 'suspended';
export type ClaimStatus = (typeof CLAIM_STATUSES)[keyof typeof CLAIM_STATUSES];

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  procedureCode?: string;
  flaggedOnly?: boolean | string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
