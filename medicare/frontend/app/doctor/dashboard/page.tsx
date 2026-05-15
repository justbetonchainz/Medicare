import { Calendar, CalendarClock, CheckSquare } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { AppointmentCard } from '@/components/AppointmentCard';
import { EmptyState } from '@/components/ui/empty-state';
import { serverApi } from '@/lib/server-api';
import type { Appointment, DoctorStats } from '@/types';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Doctor Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DoctorDashboard() {
  let stats: DoctorStats = { todayAppointments: 0, upcomingAppointments: 0, totalAppointments: 0 };
  let all: Appointment[] = [];
  try {
    stats = await serverApi.get<DoctorStats>('/dashboard/doctor');
  } catch { /* empty */ }
  try {
    all = await serverApi.get<Appointment[]>('/appointments/me');
  } catch { /* empty */ }

  const today = new Date().toISOString().slice(0, 10);
  const todays = all.filter((a) => a.appointmentDate === today && a.status !== 'cancelled');

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-500">Overview of your schedule and appointments</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Today" value={stats.todayAppointments} tone="amber" icon={Calendar} />
        <StatsCard label="Upcoming" value={stats.upcomingAppointments} tone="blue" icon={CalendarClock} />
        <StatsCard label="Total" value={stats.totalAppointments} tone="green" icon={CheckSquare} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">
            Today&apos;s appointments
            {todays.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold px-1.5">
                {todays.length}
              </span>
            )}
          </h2>
        </div>

        {todays.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Nothing scheduled today"
            description="You have no appointments for today. Check your agenda for upcoming slots."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {todays.map((a) => (
              <AppointmentCard key={a.id} appointment={a} perspective="doctor" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
