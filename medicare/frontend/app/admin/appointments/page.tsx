import { CalendarSearch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { serverApi } from '@/lib/server-api';
import { formatDate, formatTime } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Appointments' };
export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<AppointmentStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'danger',
};

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: { status?: string; from?: string; to?: string };
}) {
  const params = new URLSearchParams();
  if (searchParams.status) params.set('status', searchParams.status);
  if (searchParams.from) params.set('from', searchParams.from);
  if (searchParams.to) params.set('to', searchParams.to);
  const qs = params.toString();

  let appointments: Appointment[] = [];
  try {
    appointments = await serverApi.get<Appointment[]>(
      `/appointments${qs ? `?${qs}` : ''}`,
    );
  } catch { /* empty */ }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
        <p className="mt-0.5 text-sm text-slate-500">{appointments.length} result{appointments.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filter bar */}
      <form className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-end gap-4" method="get">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
          <select
            name="status"
            defaultValue={searchParams.status ?? ''}
            className="h-9 rounded-lg border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">From</label>
          <input
            type="date"
            name="from"
            defaultValue={searchParams.from ?? ''}
            className="h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">To</label>
          <input
            type="date"
            name="to"
            defaultValue={searchParams.to ?? ''}
            className="h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-lg bg-brand-600 text-white px-4 text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Apply
        </button>
        {qs && (
          <a href="/admin/appointments" className="text-sm text-slate-500 hover:underline self-end h-9 flex items-center">
            Clear
          </a>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={CalendarSearch}
              title="No appointments found"
              description="Try adjusting your filters to see more results."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Time</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Patient</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Doctor</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{formatDate(a.appointmentDate)}</td>
                    <td className="px-5 py-3 text-slate-500">{formatTime(a.appointmentTime)}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {a.patient?.user
                        ? `${a.patient.user.firstName} ${a.patient.user.lastName}`
                        : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {a.doctor?.user
                        ? `Dr. ${a.doctor.user.firstName} ${a.doctor.user.lastName}`
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[a.status]} dot>{a.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
