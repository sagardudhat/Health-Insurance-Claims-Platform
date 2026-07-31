'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  const { totalItems, totalPages, currentPage, itemsPerPage, hasNextPage, hasPrevPage } =
    pagination;

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="sticky bottom-0 z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-t border-[var(--border)] text-xs shadow-xs">
      {/* Items Range Display & Page Size Dropdown */}
      <div className="flex items-center gap-3 text-[var(--text-secondary)]">
        <span>
          Showing <strong className="text-[var(--text-primary)] font-semibold">{startItem}</strong>{' '}
          to <strong className="text-[var(--text-primary)] font-semibold">{endItem}</strong> of{' '}
          <strong className="text-[var(--text-primary)] font-semibold">{totalItems}</strong> entries
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1 ml-2">
            <span>Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="py-1 px-2 rounded border border-[var(--border)] bg-white text-xs font-semibold focus:ring-1 focus:ring-[var(--brand-500)]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2 text-xs"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          <span>Prev</span>
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            // Only show nearby pages if totalPages is large
            if (
              totalPages > 7 &&
              Math.abs(pageNum - currentPage) > 2 &&
              pageNum !== 1 &&
              pageNum !== totalPages
            ) {
              if (Math.abs(pageNum - currentPage) === 3) {
                return (
                  <span key={pageNum} className="px-1 text-gray-400">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`h-8 w-8 rounded-lg font-semibold transition-colors text-xs ${
                  currentPage === pageNum
                    ? 'bg-[var(--brand-500)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2 text-xs"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </Button>
      </div>
    </div>
  );
};
