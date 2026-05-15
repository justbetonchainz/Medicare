import { Calendar, Clock, User, FileText } from 'lucide-react';
import { Badge } from './ui/badge';
import { formatDate, formatTime } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types';

const STATUS_TONE: Record<AppointmentStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'danger',
};

export function AppointmentCard({
  appointment,
  perspective,
  actions,
}: {
  appointment: Appointment;
  perspective: 'patient' | 'doctor' | 'admin';
  actions?: React.ReactNode;
}) {
  const a = appointment;
  const personName =
    perspective === 'patient'
      ? a.doctor
        ? `Dr. ${a.doctor.user.firstName} ${a.doctor.user.lastName}`
        : '—'
      : a.patient?.user
      ? `${a.patient.user.firstName} ${a.patient.user.lastName}`
      : '—';

  const specialty =
    perspective !== 'doctor' && a.doctor?.specialty?.name
      ? a.doctor.specialty.name
      : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 card-hover animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <User size={14} className="text-slate-400 shrink-0" />
            <span className="font-semibold text-sm text-slate-900 truncate">{personName}</span>
          </div>
          {specialty && (
            <div className="mt-0.5 ml-5 text-xs text-slate-400">{specialty}</div>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar size={12} className="text-brand-400" />
              {formatDate(a.appointmentDate)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={12} className="text-brand-400" />
              {formatTime(a.appointmentTime)}
            </div>
          </div>
          {a.reason && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
              <FileText size={12} className="text-slate-400 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{a.reason}</span>
            </div>
          )}
        </div>
        <Badge tone={STATUS_TONE[a.status]} dot>
          {a.status}
        </Badge>
      </div>
      {actions && <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">{actions}</div>}
    </div>
  );
}
