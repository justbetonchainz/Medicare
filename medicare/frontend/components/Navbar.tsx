'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Stethoscope, ChevronDown, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SessionUser } from '@/lib/auth';

const ROLE_DASH: Record<string, string> = {
  admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  patient: '/patient/dashboard',
};

function Avatar({ user }: { user: SessionUser }) {
  const initials = `${user.email[0]}`.toUpperCase();
  const colors: Record<string, string> = {
    admin: 'bg-violet-600',
    doctor: 'bg-brand-600',
    patient: 'bg-emerald-600',
  };
  return (
    <div
      className={cn(
        'h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0',
        colors[user.role] ?? 'bg-slate-600',
      )}
    >
      {initials}
    </div>
  );
}

export function Navbar({ session }: { session: SessionUser | null }) {
  const pathname = usePathname();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dashHref = session ? (ROLE_DASH[session.role] ?? '/') : '/login';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/doctors', label: 'Doctors' },
  ];

  return (
    <nav className="sticky top-0 z-40 glass">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
          <Stethoscope size={20} className="text-brand-600" />
          <span className="text-lg tracking-tight">MedRDV</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname === l.href
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {session ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen((p) => !p)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors"
              >
                <Avatar user={session} />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold leading-none">{session.email.split('@')[0]}</div>
                  <div className="text-[10px] text-slate-400 capitalize mt-0.5">{session.role}</div>
                </div>
                <ChevronDown
                  size={14}
                  className={cn('text-slate-400 transition-transform', dropOpen && 'rotate-180')}
                />
              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg animate-slide-up overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="text-xs font-semibold truncate">{session.email}</div>
                    <div className="text-[10px] text-slate-400 capitalize mt-0.5">{session.role}</div>
                  </div>
                  <div className="p-1">
                    <Link
                      href={dashHref}
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <form action="/api/auth/logout" method="post">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm"
              >
                Get started
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-slate-100"
            onClick={() => setMobileOpen((p) => !p)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 animate-slide-up">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50"
            >
              {l.label}
            </Link>
          ))}
          {!session && (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50">Sign in</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-sm text-brand-600 font-medium hover:bg-brand-50">Get started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
