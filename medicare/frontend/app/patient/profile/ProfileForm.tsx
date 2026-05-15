'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Patient, User } from '@/types';

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function ProfileForm({ user, patient }: { user: User; patient: Patient | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');
    const fd = new FormData(e.currentTarget);
    const [r1, r2] = await Promise.all([
      fetch('/api/proxy/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fd.get('firstName'),
          lastName: fd.get('lastName'),
          phone: fd.get('phone') || undefined,
        }),
      }),
      fetch('/api/proxy/patients/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: fd.get('birthDate') || undefined,
          address: fd.get('address') || undefined,
          gender: fd.get('gender') || undefined,
        }),
      }),
    ]);
    setSaving(false);
    if (!r1.ok || !r2.ok) { setStatus('error'); return; }
    setStatus('success');
    router.refresh();
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="First name">
          <Input name="firstName" defaultValue={user.firstName} required />
        </Field>
        <Field label="Last name">
          <Input name="lastName" defaultValue={user.lastName} required />
        </Field>
        <Field label="Email address">
          <Input value={user.email} disabled className="bg-slate-50 text-slate-400" />
        </Field>
        <Field label="Phone">
          <Input name="phone" defaultValue={user.phone ?? ''} placeholder="+212…" />
        </Field>
        <Field label="Birth date">
          <Input type="date" name="birthDate" defaultValue={patient?.birthDate ?? ''} />
        </Field>
        <Field label="Gender">
          <select
            name="gender"
            defaultValue={patient?.gender ?? ''}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">—</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <Field label="Address">
        <Input name="address" defaultValue={patient?.address ?? ''} placeholder="City, Country" />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
        {status === 'success' && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle size={15} /> Saved successfully
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle size={15} /> Failed to save
          </span>
        )}
      </div>
    </form>
  );
}
