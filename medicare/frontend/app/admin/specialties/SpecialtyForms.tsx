'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Specialty } from '@/types';

export function SpecialtyForms({ specialties }: { specialties: Specialty[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = (): void => router.refresh();

  const create = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/proxy/specialties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fd.get('name'),
        description: fd.get('description') || undefined,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { message?: string };
      setErr(j.message ?? 'Failed to create specialty');
      return;
    }
    (e.target as HTMLFormElement).reset();
    refresh();
  };

  const remove = async (id: string): Promise<void> => {
    if (!confirm('Delete this specialty? This cannot be undone.')) return;
    setBusy(true);
    await fetch(`/api/proxy/specialties/${id}`, { method: 'DELETE' });
    setBusy(false);
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
          <Plus size={14} className="text-brand-500" /> Add specialty
        </h2>
        <form className="flex flex-col sm:flex-row gap-3" onSubmit={create}>
          <Input name="name" placeholder="Specialty name" required className="sm:w-44" />
          <Input name="description" placeholder="Description (optional)" className="flex-1" />
          <Button type="submit" loading={busy} className="shrink-0">
            Add
          </Button>
        </form>
        {err && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle size={14} /> {err}
          </div>
        )}
      </div>

      {/* List */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">All specialties</h2>
        {specialties.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No specialties defined yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
            {specialties.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="font-medium text-slate-800 text-sm">{s.name}</div>
                  {s.description && (
                    <div className="text-xs text-slate-400 mt-0.5">{s.description}</div>
                  )}
                </div>
                <button
                  onClick={() => remove(s.id)}
                  disabled={busy}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
