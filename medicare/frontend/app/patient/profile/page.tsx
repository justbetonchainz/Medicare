import { serverApi } from '@/lib/server-api';
import type { Patient, User } from '@/types';
import { ProfileForm } from './ProfileForm';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'My Profile' };
export const dynamic = 'force-dynamic';

export default async function PatientProfilePage() {
  const [me, patient] = await Promise.all([
    serverApi.get<User>('/users/me'),
    serverApi.get<Patient>('/patients/me').catch(() => null),
  ]);

  const initials = `${me.firstName[0] ?? ''}${me.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-xl shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {me.firstName} {me.lastName}
          </h1>
          <p className="text-sm text-slate-500">{me.email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Personal information</h2>
          <p className="mt-0.5 text-xs text-slate-400">Update your profile details below</p>
        </div>
        <div className="p-6">
          <ProfileForm user={me} patient={patient} />
        </div>
      </div>
    </div>
  );
}
