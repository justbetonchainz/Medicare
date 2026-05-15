'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Specialty } from '@/types';

export function CreateDoctorForm({ specialties }: { specialties: Specialty[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(
      Array.from(fd.entries()).filter(([, v]) => v !== ''),
    );
    const res = await fetch('/api/proxy/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { message?: string };
      setError(j.message ?? 'Failed');
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  };

  return (
    <form className="grid gap-3 md:grid-cols-3" onSubmit={onSubmit}>
      <Input name="firstName" placeholder="First name" required />
      <Input name="lastName" placeholder="Last name" required />
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Password" required />
      <Input name="phone" placeholder="Phone" />
      <Input name="orderNumber" placeholder="Order #" />
      <select
        name="specialtyId"
        required
        className="h-10 rounded-md border border-slate-300 px-3 text-sm bg-white"
      >
        <option value="">Specialty…</option>
        {specialties.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <textarea
        name="bio"
        placeholder="Bio"
        className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <Button type="submit" disabled={loading} className="md:col-span-3">
        {loading ? 'Creating…' : 'Create doctor'}
      </Button>
      {error ? (
        <p className="md:col-span-3 text-sm text-red-600">{error}</p>
      ) : null}
    </form>
  );
}
