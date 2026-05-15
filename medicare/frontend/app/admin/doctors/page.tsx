import { Stethoscope } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { serverApi } from '@/lib/server-api';
import type { Doctor, Specialty } from '@/types';
import { CreateDoctorForm } from './CreateDoctorForm';
import { DeleteDoctorButton } from './DeleteDoctorButton';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Doctors' };
export const dynamic = 'force-dynamic';

function DoctorAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
}

export default async function AdminDoctorsPage() {
  const [doctors, specialties] = await Promise.all([
    serverApi.get<Doctor[]>('/doctors').catch(() => [] as Doctor[]),
    serverApi.get<Specialty[]>('/specialties').catch(() => [] as Specialty[]),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>
        <p className="mt-0.5 text-sm text-slate-500">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''} in the system</p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Stethoscope size={16} className="text-brand-500" />
          <h2 className="font-semibold text-slate-800">Create a doctor account</h2>
        </div>
        <div className="p-6">
          <CreateDoctorForm specialties={specialties} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {doctors.length === 0 ? (
          <div className="p-10">
            <EmptyState icon={Stethoscope} title="No doctors yet" description="Create a doctor account using the form above." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Doctor</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Specialty</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Order #</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <DoctorAvatar name={`${d.user.firstName} ${d.user.lastName}`} />
                        <span className="font-medium text-slate-800">
                          Dr. {d.user.firstName} {d.user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{d.user.email}</td>
                    <td className="px-5 py-3">
                      {d.specialty ? (
                        <span className="inline-block text-xs font-medium bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                          {d.specialty.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{d.orderNumber ?? '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <DeleteDoctorButton id={d.id} />
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
