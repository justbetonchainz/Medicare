import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CountUp } from './CountUp';

interface StatsCardProps {
  label: string;
  value: number;
  hint?: string;
  icon?: LucideIcon;
  tone?: 'blue' | 'green' | 'amber' | 'violet' | 'red';
}

const TONES = {
  blue:   { bg: 'bg-brand-50',   icon: 'bg-brand-100 text-brand-600',    val: 'text-brand-700' },
  green:  { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', val: 'text-emerald-700' },
  amber:  { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-600',    val: 'text-amber-700' },
  violet: { bg: 'bg-violet-50',  icon: 'bg-violet-100 text-violet-600',  val: 'text-violet-700' },
  red:    { bg: 'bg-red-50',     icon: 'bg-red-100 text-red-600',        val: 'text-red-700' },
};

export function StatsCard({ label, value, hint, icon: Icon, tone = 'blue' }: StatsCardProps) {
  const t = TONES[tone];

  return (
    <div className={cn('rounded-xl border border-slate-200 p-5 animate-slide-up', t.bg)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
          <div className={cn('mt-2 text-3xl font-bold tabular-nums', t.val)}>
            <CountUp value={value} />
          </div>
          {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
        </div>
        {Icon && (
          <div className={cn('rounded-lg p-2.5', t.icon)}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
