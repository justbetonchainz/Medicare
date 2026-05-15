import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Star, Stethoscope, CalendarOff } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { getSession } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import type { Availability, Doctor } from '@/types';
import { BookButton } from './BookButton';

export const dynamic = 'force-dynamic';

const SPECIALTY_COLORS: Record<string, string> = {
  Cardiology: 'bg-red-100 text-red-700',
  Dermatology: 'bg-pink-100 text-pink-700',
  Pediatrics: 'bg-yellow-100 text-yellow-700',
  Neurology: 'bg-purple-100 text-purple-700',
  'General Medicine': 'bg-green-100 text-green-700',
};

function DoctorAvatar({ name, size = 'lg' }: { name: string; size?: 'lg' | 'xl' }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const cls = size === 'xl'
    ? 'h-20 w-20 text-2xl'
    : 'h-14 w-14 text-base';
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
}

export default async function DoctorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();

  let doctor: Doctor;
  try {
    doctor = await api.get<Doctor>(`/doctors/${params.id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  let slots: Availability[] = [];
  try {
    slots = await api.get<Availability[]>(
      `/availabilities/doctor/${doctor.id}?onlyAvailable=true`,
    );
  } catch {
    /* empty */
  }

  const fullName = `${doctor.user.firstName} ${doctor.user.lastName}`;
  const specialtyColor = doctor.specialty
    ? (SPECIALTY_COLORS[doctor.specialty.name] ?? 'bg-slate-100 text-slate-700')
    : '';

  return (
    <>
      <Navbar session={session} />

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 px-4 pt-10 pb-16">
        <div className="mx-auto max-w-4xl">
          <Link href="/doctors" className="inline-flex items-center gap-1.5 text-brand-200 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to directory
          </Link>
          <div className="flex items-start gap-5">
            <DoctorAvatar name={fullName} size="xl" />
            <div className="text-white">
              <h1 className="text-2xl md:text-3xl font-extrabold">Dr. {fullName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {doctor.specialty && (
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${specialtyColor}`}>
                    {doctor.specialty.name}
                  </span>
                )}
                <Badge tone={doctor.status === 'active' ? 'success' : 'default'} dot>
                  {doctor.status}
                </Badge>
              </div>
              {doctor.orderNumber && (
                <div className="mt-2 flex items-center gap-1.5 text-brand-200 text-sm">
                  <Star size={13} /> Order #{doctor.orderNumber}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 -mt-6 pb-12">
        {/* Bio card */}
        {doctor.bio && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 mb-6">
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-700">
              <Stethoscope size={15} className="text-brand-500" /> About
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{doctor.bio}</p>
          </div>
        )}

        {/* Slots */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-1 text-sm font-semibold text-slate-700">
            <Calendar size={15} className="text-brand-500" /> Available slots
          </div>
          <p className="text-xs text-slate-400 mb-5">
            {slots.length} slot{slots.length !== 1 ? 's' : ''} available — click a slot to book
          </p>

          {slots.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title="No slots available"
              description="This doctor hasn't published any open slots yet. Check back later."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {slots.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-brand-300 hover:bg-brand-50 transition-all"
                >
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm mb-1">
                    <Calendar size={13} className="text-brand-500" />
                    {formatDate(s.date)}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
                    <Clock size={12} className="text-brand-400" />
                    {formatTime(s.startTime)} – {formatTime(s.endTime)}
                  </div>

                  {session?.role === 'patient' ? (
                    <BookButton availabilityId={s.id} />
                  ) : (
                    <Link
                      href={`/login?next=/doctors/${doctor.id}`}
                      className="block w-full text-center text-xs font-medium text-brand-600 border border-brand-200 rounded-lg py-2 hover:bg-brand-50 transition-colors"
                    >
                      Sign in to book
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
