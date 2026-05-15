'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues): Promise<void> => {
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const json = (await res.json()) as {
      success: boolean;
      data?: { user: { role: string } };
      message?: string;
    };
    if (!res.ok || !json.success || !json.data) {
      setError(json.message ?? 'Invalid credentials');
      return;
    }
    const role = json.data.user.role;
    const dest = next ?? (role === 'admin' ? '/admin/dashboard' : role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    router.push(dest);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 flex-col justify-between p-12">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <Stethoscope size={22} /> MedRDV
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Your health,<br />our priority.
          </h1>
          <p className="mt-4 text-brand-200 text-base max-w-xs">
            Book appointments with top doctors, manage your health records, and stay on top of your wellbeing.
          </p>
          <div className="mt-10 space-y-3">
            {['Trusted by 1,000+ patients', 'Verified specialist doctors', 'Instant appointment booking'].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-brand-200">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {t}
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-brand-300">© 2026 MedRDV — EMSI PFA</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 font-bold text-brand-700 text-xl mb-8">
          <Stethoscope size={20} /> MedRDV
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">Sign in to your account to continue</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  className="pl-9"
                  placeholder="you@example.com"
                  error={!!formState.errors.email}
                  {...register('email')}
                />
              </div>
              {formState.errors.email && (
                <p className="mt-1 text-xs text-red-600">{formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  className="pl-9"
                  placeholder="••••••••"
                  error={!!formState.errors.password}
                  {...register('password')}
                />
              </div>
              {formState.errors.password && (
                <p className="mt-1 text-xs text-red-600">{formState.errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle size={15} className="shrink-0" /> {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={formState.isSubmitting}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
              Create one free
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Demo accounts</p>
            <div className="space-y-1.5">
              {[
                { role: 'Admin', email: 'admin@medrdv.local', pw: 'Admin1234', color: 'text-violet-600' },
                { role: 'Doctor', email: 'doctor@medrdv.local', pw: 'Doctor1234', color: 'text-brand-600' },
                { role: 'Patient', email: 'patient@medrdv.local', pw: 'Patient1234', color: 'text-emerald-600' },
              ].map((a) => (
                <div key={a.role} className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${a.color}`}>{a.role}</span>
                  <span className="text-slate-400">{a.email} / {a.pw}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
