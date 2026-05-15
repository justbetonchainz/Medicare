import { CalendarPlus, CalendarOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { serverApi } from '@/lib/server-api';
import { formatDate, formatTime } from '@/lib/utils';
import type { Availability } from '@/types';
import { CreateSlotForm } from './CreateSlotForm';
import { DeleteSlotButton } from './DeleteSlotButton';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'My Availabilities' };
export const dynamic = 'force-dynamic';

export default async function DoctorAvailabilitiesPage() {
  let slots: Availability[] = [];
  try {
    slots = await serverApi.get<Availability[]>('/availabilities/me');
  } catch { /* empty */ }

  const available = slots.filter((s) => s.status === 'available');
  const booked = slots.filter((s) => s.status !== 'available');

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Availabilities</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Manage your open slots — patients can book directly from your profile
        </p>
      </div>

      {/* Create slot form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <CalendarPlus size={16} className="text-brand-500" />
          <h2 className="font-semibold text-slate-800">Add a slot</h2>
        </div>
        <div className="p-6">
          <CreateSlotForm />
        </div>
      </div>

      {/* Available slots */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Open slots</h2>
          <span className="text-xs text-slate-400">{available.length} available</span>
        </div>

        {available.length === 0 ? (
          <EmptyState
            icon={CalendarOff}
            title="No open slots"
            description="Add a slot above to start accepting patient bookings."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {available.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between card-hover"
              >
                <div>
                  <div className="font-medium text-slate-800 text-sm">{formatDate(s.date)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {formatTime(s.startTime)} – {formatTime(s.endTime)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="success" dot>available</Badge>
                  <DeleteSlotButton id={s.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booked slots */}
      {booked.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Booked slots</h2>
            <span className="text-xs text-slate-400">{booked.length} booked</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {booked.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between opacity-70"
              >
                <div>
                  <div className="font-medium text-slate-700 text-sm">{formatDate(s.date)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {formatTime(s.startTime)} – {formatTime(s.endTime)}
                  </div>
                </div>
                <Badge tone="warning" dot>{s.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
