'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Doctor, Specialty, User } from '@/types';

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

export function DoctorProfileForm({
  user,
  doctor,
  specialties,
}: {
  user: User;
  doctor: Doctor | null;
  specialties: Specialty[];
}) {
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
      fetch('/api/proxy/doctors/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialtyId: fd.get('specialtyId') || undefined,
          orderNumber: fd.get('orderNumber') || undefined,
          bio: fd.get('bio') || undefined,
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
        <Field label="Specialty">
          <select
            name="specialtyId"
            defaultValue={doctor?.specialtyId ?? ''}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">—</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Order number">
          <Input name="orderNumber" defaultValue={doctor?.orderNumber ?? ''} placeholder="e.g. 12345" />
        </Field>
      </div>

      <Field label="Bio">
        <textarea
          name="bio"
          rows={4}
          defaultValue={doctor?.bio ?? ''}
          placeholder="Write a short bio visible to patients…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
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
