import Link from 'next/link';
import { Calendar, PlusCircle } from 'lucide-react';
import { AppointmentCard } from '@/components/AppointmentCard';
import { EmptyState } from '@/components/ui/empty-state';
import { serverApi } from '@/lib/server-api';
import type { Appointment } from '@/types';
import { CancelButton } from './CancelButton';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'My Appointments' };
export const dynamic = 'force-dynamic';

export default async function PatientAppointmentsPage() {
  let appointments: Appointment[] = [];
  try {
    appointments = await serverApi.get<Appointment[]>('/appointments/me');
  } catch { /* empty */ }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appointments.filter(
    (a) => a.status !== 'cancelled' && a.appointmentDate >= today,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {upcoming.length} active appointment{upcoming.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm"
        >
          <PlusCircle size={16} /> Book new
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No active appointments"
          description="You have no upcoming appointments. Browse doctors and book a slot."
          action={{ label: 'Find a doctor', href: '/doctors' }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {upcoming.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              perspective="patient"
              actions={
                a.status !== 'cancelled' ? <CancelButton id={a.id} /> : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
