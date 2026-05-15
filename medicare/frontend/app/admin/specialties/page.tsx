import { serverApi } from '@/lib/server-api';
import type { Specialty } from '@/types';
import { SpecialtyForms } from './SpecialtyForms';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Specialties' };
export const dynamic = 'force-dynamic';

export default async function AdminSpecialtiesPage() {
  let specialties: Specialty[] = [];
  try {
    specialties = await serverApi.get<Specialty[]>('/specialties');
  } catch { /* empty */ }

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Specialties</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {specialties.length} specialty{specialties.length !== 1 ? 'ies' : ''} configured
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          <SpecialtyForms specialties={specialties} />
        </div>
      </div>
    </div>
  );
}
