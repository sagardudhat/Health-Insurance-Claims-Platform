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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] space-y-4">
          <Skeleton className="h-4 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[var(--border)] space-y-4">
          <Skeleton className="h-4 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[var(--border)] space-y-4">
        <Skeleton className="h-5 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>

      <TableSkeleton rows={3} columns={4} />
    </div>
  );
};
