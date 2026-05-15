import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActionProp = React.ReactNode | { label: string; href: string };

function isActionObj(a: ActionProp): a is { label: string; href: string } {
  return (
    typeof a === 'object' &&
    a !== null &&
    'label' in (a as Record<string, unknown>) &&
    'href' in (a as Record<string, unknown>)
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ActionProp;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="rounded-full bg-slate-100 p-4 mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description ? (
        <p className="mt-1 text-xs text-slate-400 max-w-xs">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-4">
          {isActionObj(action) ? (
            <Link
              href={action.href}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium px-4 py-2 hover:bg-brand-700 transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            action
          )}
        </div>
      ) : null}
    </div>
  );
}
