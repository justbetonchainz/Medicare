import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-lg border bg-white px-3 text-sm transition-all duration-150',
        'placeholder:text-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 focus:border-brand-400',
        error
          ? 'border-red-400 focus:ring-red-400 animate-shake'
          : 'border-slate-300 hover:border-slate-400',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50',
        className,
      )}
      {...rest}
    />
  ),
);
Input.displayName = 'Input';
