import { Search, SlidersHorizontal, UserRound } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { DoctorCard } from '@/components/DoctorCard';
import { EmptyState } from '@/components/ui/empty-state';
import { getSession } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import type { Doctor, Specialty } from '@/types';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Find a Doctor' };
export const dynamic = 'force-dynamic';

async function safeGet<T>(path: string, fallback: T): Promise<T> {
  try {
    return await api.get<T>(path);
  } catch (e) {
    if (e instanceof ApiError) return fallback;
    return fallback;
  }
}

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: { search?: string; specialtyId?: string };
}) {
  const session = await getSession();
  const params = new URLSearchParams();
  if (searchParams.search) params.set('search', searchParams.search);
  if (searchParams.specialtyId) params.set('specialtyId', searchParams.specialtyId);
  const qs = params.toString();

  const [doctors, specialties] = await Promise.all([
    safeGet<Doctor[]>(`/doctors${qs ? `?${qs}` : ''}`, []),
    safeGet<Specialty[]>('/specialties', []),
  ]);

  return (
    <>
      <Navbar session={session} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 pt-14 pb-20 px-4 text-center">
        <p className="text-brand-200 text-sm font-medium mb-2 uppercase tracking-widest">MedRDV Directory</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Find the right doctor</h1>
        <p className="text-brand-200 text-base max-w-md mx-auto">
          Browse our network of verified specialists and book an appointment in seconds.
        </p>
      </div>

      {/* Search card floating over hero */}
      <div className="mx-auto max-w-5xl px-4 -mt-8">
        <form
          method="get"
          className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex flex-col md:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="search"
              placeholder="Search by name or specialty…"
              defaultValue={searchParams.search ?? ''}
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div className="relative md:w-52">
            <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              name="specialtyId"
              defaultValue={searchParams.specialtyId ?? ''}
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All specialties</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="h-10 rounded-lg bg-brand-600 text-white text-sm font-medium px-6 hover:bg-brand-700 transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-slate-500">
            {doctors.length === 0
              ? 'No doctors found'
              : `${doctors.length} doctor${doctors.length > 1 ? 's' : ''} available`}
          </h2>
          {(searchParams.search || searchParams.specialtyId) && (
            <a href="/doctors" className="text-sm text-brand-600 hover:underline">
              Clear filters
            </a>
          )}
        </div>

        {doctors.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="No doctors match your search"
            description="Try broadening your search or removing the specialty filter."
            action={{ label: 'View all doctors', href: '/doctors' }}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d) => (
              <DoctorCard key={d.id} doctor={d} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
