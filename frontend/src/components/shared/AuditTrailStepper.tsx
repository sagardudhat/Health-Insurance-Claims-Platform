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
}) => {
  // Helper to determine the icon and color based on the action/status
  const getStepVisuals = (action: string, status: string) => {
    if (status === 'APPROVED' || status === 'PARTIALLY_APPROVED') {
      return {
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-500',
      };
    }
    if (status === 'REJECTED') {
      return {
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-500',
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
        color: 'text-emerald-700',
        bg: 'bg-emerald-100',
        border: 'border-emerald-600',
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
    return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300' };
  };

  // Human-readable title generator
  const getTitle = (action: string, toStatus: string) => {
    if (action === 'CLAIM_SUBMITTED') return 'Claim Submitted';
    if (action === 'STATUS_CHANGED') {
      const formattedStatus = toStatus ? toStatus.replace(/_/g, ' ') : '';
      return `Status: ${formattedStatus}`;
    }
    return action.replace(/_/g, ' ');
  };

  // Sort logs oldest to newest so the timeline flows downward
  const sortedLogs = [...(auditTrail || [])].sort(
    (a, b) =>
      new Date(a.timestamp || new Date()).getTime() - new Date(b.timestamp || new Date()).getTime()
  );

  return (
    <div className="relative space-y-5 pl-0.5 py-1 before:absolute before:inset-0 before:ml-[1.1rem] before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-[var(--brand-400)] before:via-gray-200 before:to-transparent">
      {sortedLogs.map((log, index) => {
        const visuals = getStepVisuals(log.action, log.toStatus);
        const Icon = visuals.icon;
        const isLast = index === sortedLogs.length - 1;
        const title = getTitle(log.action, log.toStatus);

        return (
          <div key={log._id || index} className="relative flex gap-3 items-start group">
            {/* Timeline Line hiding connector for last item */}
            {isLast && (
              <div className="absolute left-[0.95rem] top-7 bottom-0 w-1 bg-white -translate-x-1 z-0" />
            )}

            {/* Icon Node */}
            <div
              className={`relative z-10 flex shrink-0 items-center justify-center w-9 h-9 rounded-full border-2 shadow-xs transition-transform duration-300 group-hover:scale-105 ${visuals.bg} ${visuals.border} ${visuals.color}`}
            >
              <Icon className="w-4 h-4" />
            </div>

            {/* Content Card */}
            <div className="flex-1 min-w-0 bg-white border border-[var(--border)] rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-start justify-between mb-1.5 gap-2 flex-wrap">
                <h4 className="text-xs font-bold text-gray-900 leading-snug break-words">
                  {title}
                </h4>
                <time className="text-[10px] font-medium text-[var(--text-muted)] shrink-0 whitespace-nowrap">
                  {format(new Date(log.timestamp || new Date()), 'MMM d, h:mm a')}
                </time>
              </div>

              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                  {log.role}
                </span>
                <span className="text-xs font-medium text-[var(--text-secondary)] break-words">
                  {log.performedBy?.name || log.performedBy?.email || 'System'}
                </span>
              </div>

              {log.note && (
                <div
                  className={`mt-2 p-2.5 rounded-lg text-xs leading-relaxed break-words ${
                    log.toStatus === 'NEEDS_REVISION'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-gray-50 text-gray-700 border border-gray-100'
                  }`}
                >
                  {log.toStatus === 'NEEDS_REVISION' && (
                    <div className="font-semibold text-amber-700 mb-1 flex items-center gap-1.5 text-[11px]">
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
