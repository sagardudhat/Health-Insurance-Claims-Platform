import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return <div className={`animate-pulse rounded-lg bg-gray-200/80 ${className}`} {...props} />;
};

export const StatCardsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-xl border border-[var(--border)] shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 6,
}) => {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs overflow-hidden">
      <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-4 border-b border-[var(--border)] pb-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 py-2">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ClaimDetailsSkeleton: React.FC = () => {
  return (
    <div className="h-full flex flex-col min-h-0 space-y-4 overflow-hidden">
      {/* Header Banner Skeleton */}
      <div className="shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      {/* 2-Column Content + Right Sidebar Layout */}
      <div className="flex-1 flex min-h-0 gap-6">
        {/* Main Content Area Skeleton */}
        <div className="flex-1 space-y-6 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[var(--border)] space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[var(--border)] space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[var(--border)] space-y-4">
            <Skeleton className="h-4 w-48" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </div>

          <TableSkeleton rows={3} columns={5} />
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="w-96 lg:w-[390px] xl:w-[420px] shrink-0 bg-white rounded-xl border border-[var(--border)] p-4 space-y-4 flex flex-col">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
