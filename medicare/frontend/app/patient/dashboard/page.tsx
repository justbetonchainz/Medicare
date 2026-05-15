import Link from 'next/link';
import { Calendar, CalendarCheck, CalendarX, PlusCircle } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { AppointmentCard } from '@/components/AppointmentCard';
import { EmptyState } from '@/components/ui/empty-state';
import { serverApi } from '@/lib/server-api';
import type { Appointment } from '@/types';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'My Dashboard' };
export const dynamic = 'force-dynamic';

export default async function PatientDashboard() {
  let upcoming: Appointment[] = [];
  let all: Appointment[] = [];
  try {
    upcoming = await serverApi.get<Appointment[]>('/appointments/me/upcoming');
  } catch { /* empty */ }
  try {
    all = await serverApi.get<Appointment[]>('/appointments/me');
  } catch { /* empty */ }

  const total = all.length;
  const cancelled = all.filter((a) => a.status === 'cancelled').length;
  const confirmed = all.filter((a) => a.status === 'confirmed').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage your health appointments in one place</p>
        </div>
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm"
        >
          <PlusCircle size={16} /> Book appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Upcoming" value={upcoming.length} tone="blue" icon={Calendar} />
        <StatsCard label="Confirmed" value={confirmed} tone="green" icon={CalendarCheck} />
        <StatsCard label="Cancelled" value={cancelled} tone="red" icon={CalendarX} />
      </div>

      {/* Upcoming appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Upcoming appointments</h2>
          {upcoming.length > 0 && (
            <Link href="/patient/appointments" className="text-sm text-brand-600 hover:underline">
              View all →
            </Link>
          )}
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming appointments"
            description="You don't have any appointments scheduled. Find a doctor and book a slot today."
            action={{ label: 'Find a doctor', href: '/doctors' }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.slice(0, 4).map((a) => (
              <AppointmentCard key={a.id} appointment={a} perspective="patient" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
