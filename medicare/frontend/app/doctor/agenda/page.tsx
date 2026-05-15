import { CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { serverApi } from '@/lib/server-api';
import { formatDate, formatTime } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types';
import { AppointmentActions } from './AppointmentActions';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'My Agenda' };
export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<AppointmentStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'danger',
};

export default async function DoctorAgendaPage() {
  let appointments: Appointment[] = [];
  try {
    appointments = await serverApi.get<Appointment[]>('/appointments/me');
  } catch { /* empty */ }

  const grouped = new Map<string, Appointment[]>();
  for (const a of appointments) {
    const list = grouped.get(a.appointmentDate) ?? [];
    list.push(a);
    grouped.set(a.appointmentDate, list);
  }
  const days = Array.from(grouped.keys()).sort();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
        <p className="mt-1 text-sm text-slate-500">Your full appointment schedule</p>
      </div>

      {days.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No appointments yet"
          description="Your agenda is empty. Patients will appear here once they book a slot."
        />
      ) : (
        days.map((day) => {
          const isToday = day === today;
          const appts = grouped
            .get(day)!
            .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

          return (
            <div key={day}>
              {/* Day header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${isToday ? 'bg-brand-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className={`text-sm font-semibold ${isToday ? 'text-brand-700' : 'text-slate-700'}`}>
                    {formatDate(day)}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-semibold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      Today
                    </span>
                  )}
                </div>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">{appts.length} appointment{appts.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Timeline */}
              <div className="relative pl-6 space-y-3">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-200" />
                {appts.map((a) => (
                  <div key={a.id} className="relative">
                    <div className="absolute -left-4 top-4 h-2 w-2 rounded-full border-2 border-white bg-brand-400 shadow" />
                    <div className="rounded-xl border border-slate-200 bg-white p-4 card-hover">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                              {formatTime(a.appointmentTime)}
                            </span>
                            <span className="font-semibold text-sm text-slate-900">
                              {a.patient?.user
                                ? `${a.patient.user.firstName} ${a.patient.user.lastName}`
                                : '—'}
                            </span>
                          </div>
                          {a.reason && (
                            <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{a.reason}</p>
                          )}
                        </div>
                        <Badge tone={STATUS_TONE[a.status]} dot>{a.status}</Badge>
                      </div>
                      <div className="mt-3">
                        <AppointmentActions id={a.id} status={a.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
