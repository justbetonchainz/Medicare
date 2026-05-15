import { ClockIcon } from 'lucide-react';
import { AppointmentCard } from '@/components/AppointmentCard';
import { EmptyState } from '@/components/ui/empty-state';
import { serverApi } from '@/lib/server-api';
import type { Appointment } from '@/types';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Appointment History' };
export const dynamic = 'force-dynamic';

export default async function PatientHistoryPage() {
  let appointments: Appointment[] = [];
  try {
    appointments = await serverApi.get<Appointment[]>('/appointments/me');
  } catch { /* empty */ }

  const today = new Date().toISOString().slice(0, 10);
  const past = appointments.filter(
    (a) => a.appointmentDate < today || a.status === 'cancelled' || a.status === 'completed',
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Appointment History</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {past.length} past appointment{past.length !== 1 ? 's' : ''}
        </p>
      </div>

      {past.length === 0 ? (
        <EmptyState
          icon={ClockIcon}
          title="No history yet"
          description="Your completed and cancelled appointments will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {past.map((a) => (
            <AppointmentCard key={a.id} appointment={a} perspective="patient" />
          ))}
        </div>
      )}
    </div>
  );
}
