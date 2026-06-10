import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'red' | 'emerald' | 'amber' | 'blue';
  loading?: boolean;
}

export function StatsCard({ title, value, icon: Icon, color = 'red', loading }: StatsCardProps) {
  const colorMap = {
    red: 'bg-red-50 text-red-600 border-red-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
        <div className="h-4 w-24 bg-slate-100 rounded mb-4" />
        <div className="h-8 w-16 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-800 tracking-tight">{value}</div>
    </div>
  );
}
