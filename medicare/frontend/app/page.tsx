import Link from 'next/link';
import { Stethoscope, Calendar, Shield, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { DoctorCard } from '@/components/DoctorCard';
import { getSession } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import type { Doctor, Specialty } from '@/types';

export const dynamic = 'force-dynamic';

async function safeGet<T>(path: string, fallback: T): Promise<T> {
  try { return await api.get<T>(path); }
  catch (e) { if (e instanceof ApiError) return fallback; return fallback; }
}

const FEATURES = [
  { icon: Calendar, title: 'Easy booking', desc: 'Book appointments in seconds, no phone calls needed.' },
  { icon: Stethoscope, title: 'Top doctors', desc: 'Access verified specialists across multiple fields.' },
  { icon: Shield, title: 'Secure & private', desc: 'Your health data is protected and never shared.' },
];

const PERKS = [
  'No registration fees',
  'Same-day availability',
  'Digital appointment records',
  'Instant confirmation',
];

export default async function HomePage() {
  const session = await getSession();
  const [specialties, doctors] = await Promise.all([
    safeGet<Specialty[]>('/specialties', []),
    safeGet<Doctor[]>('/doctors', []),
  ]);

  return (
    <>
      <Navbar session={session} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs text-white/80 mb-6 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Platform now live — join thousands of patients
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Find a doctor.<br />
            <span className="text-brand-200">Book in seconds.</span>
          </h1>
          <p className="mt-6 text-lg text-brand-100 max-w-2xl mx-auto leading-relaxed">
            MedRDV connects patients with trusted doctors across multiple specialties.
            Manage your health appointments online, anytime, anywhere.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {session ? (
              <Link
                href={
                  session.role === 'admin'
                    ? '/admin/dashboard'
                    : session.role === 'doctor'
                    ? '/doctor/dashboard'
                    : '/patient/dashboard'
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-700 font-semibold px-6 py-3 hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl"
              >
                Go to dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-700 font-semibold px-6 py-3 hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl"
                >
                  Sign in <ArrowRight size={16} />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 text-white font-semibold px-6 py-3 hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Create your account
                </Link>
              </>
            )}
            {session && (
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 text-white font-semibold px-6 py-3 hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Browse doctors
              </Link>
            )}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {PERKS.map((p) => (
              <div key={p} className="flex items-center gap-1.5 text-xs text-brand-200">
                <CheckCircle2 size={12} className="text-emerald-400" /> {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Why MedRDV?</h2>
          <p className="mt-2 text-slate-500 text-sm">Everything you need for modern healthcare access</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 card-hover text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center">
                <f.icon size={22} className="text-brand-600" />
              </div>
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Specialties */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Medical specialties</h2>
              <p className="mt-1 text-sm text-slate-500">{specialties.length} specialties available</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {specialties.map((s) => (
              <Link
                key={s.id}
                href={`/doctors?specialtyId=${s.id}`}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-all shadow-sm"
              >
                <Star size={12} className="text-brand-400" /> {s.name}
              </Link>
            ))}
            {specialties.length === 0 && (
              <p className="text-sm text-slate-400">No specialties yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Featured doctors */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured doctors</h2>
            <p className="mt-1 text-sm text-slate-500">Meet our top-rated specialists</p>
          </div>
          <Link
            href="/doctors"
            className="text-sm font-medium text-brand-600 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {doctors.slice(0, 6).map((d) => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
          {doctors.length === 0 && (
            <p className="col-span-full text-sm text-slate-400">No doctors listed yet.</p>
          )}
        </div>
      </section>

      {/* CTA */}
      {!session && (
        <section className="bg-gradient-to-r from-brand-600 to-brand-800 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-bold text-white">Ready to take control of your health?</h2>
            <p className="mt-3 text-brand-200 text-sm">Create a free account and book your first appointment today.</p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white text-brand-700 font-semibold px-8 py-3 hover:bg-brand-50 transition-all shadow-lg"
            >
              Create free account <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <Stethoscope size={14} className="text-brand-600" /> MedRDV
          </div>
          <div>Academic project — EMSI PFA © 2026</div>
        </div>
      </footer>
    </>
  );
}
