import React from 'react';
import { AuditLogEntry } from '@/features/claims/types';
import { format } from 'date-fns';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  DollarSign,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface AuditTrailStepperProps {
  auditTrail: AuditLogEntry[];
  currentStatus: string;
}

export const AuditTrailStepper: React.FC<AuditTrailStepperProps> = ({
  auditTrail,
  currentStatus,
}) => {
  // Helper to determine the icon and color based on the action/status
  const getStepVisuals = (action: string, status: string) => {
    if (status === 'APPROVED' || status === 'PARTIALLY_APPROVED') {
      return {
        icon: CheckCircle2,
        color: 'text-[var(--status-approved)]',
        bg: 'bg-[var(--status-approved-bg)]',
        border: 'border-[var(--status-approved)]',
      };
    }
    if (status === 'REJECTED') {
      return {
        icon: XCircle,
        color: 'text-[var(--status-rejected)]',
        bg: 'bg-[var(--status-rejected-bg)]',
        border: 'border-[var(--status-rejected)]',
      };
    }
    if (status === 'NEEDS_REVISION' || action.includes('REVISION')) {
      return {
        icon: RefreshCw,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-500',
      };
    }
    if (status === 'PAID') {
      return {
        icon: DollarSign,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-500',
      };
    }
    if (status === 'SUBMITTED' || action.includes('SUBMITTED')) {
      return {
        icon: FileText,
        color: 'text-[var(--brand-600)]',
        bg: 'bg-[var(--brand-50)]',
        border: 'border-[var(--brand-500)]',
      };
    }
    // Default (e.g. UNDER_REVIEW)
    return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-300' };
  };

  // Sort logs oldest to newest so the timeline flows downward
  const sortedLogs = [...(auditTrail || [])].sort(
    (a, b) =>
      new Date(a.timestamp || new Date()).getTime() - new Date(b.timestamp || new Date()).getTime()
  );

  return (
    <div className="relative space-y-6 pl-1 py-1 before:absolute before:inset-0 before:ml-[1.65rem] before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-[var(--brand-300)] before:via-gray-200 before:to-transparent">
      {sortedLogs.map((log, index) => {
        const visuals = getStepVisuals(log.action, log.toStatus);
        const Icon = visuals.icon;
        const isLast = index === sortedLogs.length - 1;

        return (
          <div key={log._id || index} className="relative flex gap-4 items-start group">
            {/* Timeline Line (hides last connecting line segment) */}
            {isLast && (
              <div className="absolute left-[1.4rem] top-8 bottom-0 w-1 bg-white -translate-x-1 z-0" />
            )}

            {/* Icon Node */}
            <div
              className={`relative z-10 flex shrink-0 items-center justify-center w-11 h-11 rounded-full border-2 shadow-sm transition-transform duration-300 group-hover:scale-110 ${visuals.bg} ${visuals.border} ${visuals.color}`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Content Card */}
            <div className="flex-1 min-w-0 bg-white border border-[var(--border)] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                  {log.action.replace(/_/g, ' ')}
                </h4>
                <time className="text-[11px] font-medium text-[var(--text-muted)] shrink-0 whitespace-nowrap">
                  {format(new Date(log.timestamp || new Date()), 'MMM d, h:mm a')}
                </time>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-600">
                  {log.role}
                </span>
                <span className="text-xs text-[var(--text-secondary)] truncate">
                  {log.performedBy.name || log.performedBy.email || 'System'}
                </span>
              </div>

              {log.note && (
                <div
                  className={`mt-2 p-2.5 rounded-lg text-xs leading-relaxed ${log.toStatus === 'NEEDS_REVISION' ? 'bg-amber-50/50 text-amber-800 border border-amber-100' : 'bg-gray-50 text-[var(--text-secondary)]'}`}
                >
                  {log.toStatus === 'NEEDS_REVISION' && (
                    <div className="font-semibold text-amber-700 mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Revisions Requested
                    </div>
                  )}
                  {log.note}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
