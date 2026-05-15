'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* panel */}
      <div
        ref={ref}
        className={cn(
          'relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl animate-slide-up',
          className,
        )}
      >
        {title || true ? (
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            {title ? <h2 className="text-base font-semibold">{title}</h2> : <span />}
            <button
              onClick={onClose}
              className="rounded-md p-1 hover:bg-slate-100 text-slate-500"
            >
              <X size={16} />
            </button>
          </div>
        ) : null}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
