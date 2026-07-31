import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, Loader2, Activity } from 'lucide-react';

interface ChartDataItem {
  name: string;
  status: string;
  Claims: number;
  color: string;
}

interface AdminDashboardChartsProps {
  chartData: ChartDataItem[];
  isLoading: boolean;
}

export const AdminDashboardCharts = ({ chartData, isLoading }: AdminDashboardChartsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bar Chart: Status Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--brand-500)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Claim Status Breakdown
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-medium">Volume</span>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-500)]" />
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E7EC',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Claims" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Pie Chart: Distribution */}
      <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--brand-500)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Workflow Distribution
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-medium">Percentage</span>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-500)]" />
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.filter((d) => d.Claims > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="Claims"
                >
                  {chartData
                    .filter((d) => d.Claims > 0)
                    .map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E7EC',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
