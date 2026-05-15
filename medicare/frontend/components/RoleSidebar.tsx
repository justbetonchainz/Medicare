'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Clock, User, Users,
  Stethoscope, BookOpen, ClipboardList, Star, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';

type NavItem = { href: string; label: string; icon: React.ElementType };

const NAVS: Record<Role, NavItem[]> = {
  patient: [
    { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/patient/appointments', label: 'Appointments', icon: Calendar },
    { href: '/patient/history', label: 'History', icon: Clock },
    { href: '/patient/profile', label: 'Profile', icon: User },
  ],
  doctor: [
    { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/doctor/availabilities', label: 'Availabilities', icon: Clock },
    { href: '/doctor/agenda', label: 'Agenda', icon: Calendar },
    { href: '/doctor/profile', label: 'Profile', icon: User },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
    { href: '/admin/specialties', label: 'Specialties', icon: Star },
    { href: '/admin/appointments', label: 'Appointments', icon: ClipboardList },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  patient: 'Patient Portal',
  doctor: 'Doctor Portal',
  admin: 'Admin Portal',
};

const ROLE_COLOR: Record<Role, string> = {
  patient: 'text-emerald-600 bg-emerald-50',
  doctor: 'text-brand-600 bg-brand-50',
  admin: 'text-violet-600 bg-violet-50',
};

export function RoleSidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Portal label */}
      <div className="px-4 pt-5 pb-3">
        <span className={cn('text-[11px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md', ROLE_COLOR[role])}>
          {ROLE_LABEL[role]}
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 pb-6 space-y-0.5">
        {NAVS[role].map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <item.icon
                size={16}
                className={cn(
                  'shrink-0 transition-colors',
                  active ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600',
                )}
              />
              <span className="flex-1">{item.label}</span>
              {active && (
                <ChevronRight size={12} className="text-brand-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom decoration */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="text-[10px] text-slate-400 text-center">MedRDV v0.1</div>
      </div>
    </aside>
  );
}
