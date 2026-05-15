'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function CreateUserForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const close = (): void => {
    setOpen(false);
    setStatus('idle');
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    const fd = new FormData(e.currentTarget);
    const body = {
      firstName: fd.get('firstName'),
      lastName: fd.get('lastName'),
      email: fd.get('email'),
      password: fd.get('password'),
      role: fd.get('role'),
      phone: fd.get('phone') || undefined,
    };
    const res = await fetch('/api/proxy/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { message?: string | string[] };
      const msg = Array.isArray(j.message) ? j.message.join(', ') : (j.message ?? 'Failed to create user');
      setErrMsg(msg);
      setStatus('error');
      return;
    }
    setStatus('success');
    router.refresh();
    setTimeout(() => close(), 1200);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="inline-flex items-center gap-2">
        <UserPlus size={15} /> Add user
      </Button>

      <Modal open={open} onClose={close} title="Add a user" className="max-w-lg">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <Input name="firstName" placeholder="Karim" required />
            </Field>
            <Field label="Last name">
              <Input name="lastName" placeholder="El Amrani" required />
            </Field>
            <Field label="Email address">
              <Input type="email" name="email" placeholder="user@example.com" required />
            </Field>
            <Field label="Phone (optional)">
              <Input name="phone" placeholder="+212…" />
            </Field>
            <Field label="Password">
              <Input type="password" name="password" placeholder="Min. 8 characters" required />
            </Field>
            <Field label="Role">
              <select
                name="role"
                required
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select a role…</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle size={14} className="shrink-0" /> {errMsg}
            </div>
          )}
          {status === 'success' && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-sm text-emerald-700">
              <CheckCircle size={14} className="shrink-0" /> User created successfully
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create user
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
