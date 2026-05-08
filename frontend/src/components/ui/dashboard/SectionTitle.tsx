import type { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
  icon: LucideIcon;
  title: string;
  className?: string;
}

export function SectionTitle({ icon: Icon, title, className = "" }: SectionTitleProps) {
  return (
    <h3 className={`text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 ${className}`}>
      <Icon className="w-4 h-4" />
      {title}
    </h3>
  );
}
