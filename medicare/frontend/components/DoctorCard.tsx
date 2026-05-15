import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { Badge } from './ui/badge';
import type { Doctor } from '@/types';
import { cn } from '@/lib/utils';

const SPECIALTY_COLORS: Record<string, string> = {
  Cardiology: 'bg-red-100 text-red-700',
  Dermatology: 'bg-pink-100 text-pink-700',
  Pediatrics: 'bg-yellow-100 text-yellow-700',
  Neurology: 'bg-purple-100 text-purple-700',
  'General Medicine': 'bg-green-100 text-green-700',
};

function DoctorAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
      {initials}
    </div>
  );
}

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const fullName = `${doctor.user.firstName} ${doctor.user.lastName}`;
  const specialtyColor =
    doctor.specialty ? (SPECIALTY_COLORS[doctor.specialty.name] ?? 'bg-slate-100 text-slate-700') : '';

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 card-hover animate-slide-up">
      <div className="flex items-start gap-4">
        <DoctorAvatar name={fullName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900 truncate">Dr. {fullName}</h3>
              {doctor.specialty && (
                <span className={cn('inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full', specialtyColor)}>
                  {doctor.specialty.name}
                </span>
              )}
            </div>
            <Badge tone={doctor.status === 'active' ? 'success' : 'default'} dot>
              {doctor.status}
            </Badge>
          </div>
          {doctor.orderNumber && (
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <Star size={10} /> {doctor.orderNumber}
            </div>
          )}
        </div>
      </div>

      {doctor.bio && (
        <p className="mt-3 text-sm text-slate-500 line-clamp-2">{doctor.bio}</p>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-400 flex items-center gap-1">
          <MapPin size={10} /> Available
        </div>
        <Link
          href={`/doctors/${doctor.id}`}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline transition-colors"
        >
          View & book →
        </Link>
      </div>
    </div>
  );
}
