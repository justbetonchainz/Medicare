'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  firstName: z.string().min(2, 'At least 2 characters'),
  lastName: z.string().min(2, 'At least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
});
type FormValues = z.infer<typeof schema>;

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues): Promise<void> => {
    setError(null);
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== '' && v !== undefined),
    );
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as { success: boolean; message?: string };
    if (!res.ok || !json.success) { setError(json.message ?? 'Registration failed'); return; }
    router.push('/patient/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 flex-col justify-between p-12">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <Stethoscope size={22} /> MedRDV
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Join thousands<br />of patients.
          </h1>
          <p className="mt-4 text-brand-200 text-base max-w-xs">
            Create your free account and start booking appointments with verified doctors today.
          </p>
        </div>
        <div className="text-xs text-brand-300">© 2026 MedRDV — EMSI PFA</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50 overflow-y-auto">
        <div className="lg:hidden flex items-center gap-2 font-bold text-brand-700 text-xl mb-8">
          <Stethoscope size={20} /> MedRDV
        </div>

        <div className="w-full max-w-lg">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
            <p className="mt-1 text-sm text-slate-500">Patient registration — free & instant</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" error={formState.errors.firstName?.message}>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-9" placeholder="Karim" error={!!formState.errors.firstName} {...register('firstName')} />
                </div>
              </Field>
              <Field label="Last name" error={formState.errors.lastName?.message}>
                <Input placeholder="El Amrani" error={!!formState.errors.lastName} {...register('lastName')} />
              </Field>
            </div>

            <Field label="Email address" error={formState.errors.email?.message}>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input type="email" className="pl-9" placeholder="you@example.com" error={!!formState.errors.email} {...register('email')} />
              </div>
            </Field>

            <Field label="Password" error={formState.errors.password?.message}>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input type="password" className="pl-9" placeholder="Min. 8 characters" error={!!formState.errors.password} {...register('password')} />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone (optional)">
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-9" placeholder="+212..." {...register('phone')} />
                </div>
              </Field>
              <Field label="Birth date (optional)">
                <Input type="date" {...register('birthDate')} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Gender (optional)">
                <select
                  {...register('gender')}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-slate-400 transition-all"
                >
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Address (optional)">
                <Input placeholder="City, Country" {...register('address')} />
              </Field>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle size={15} className="shrink-0" /> {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={formState.isSubmitting}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
