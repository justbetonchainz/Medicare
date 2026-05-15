'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CreateSlotForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/proxy/availabilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: fd.get('date'),
        startTime: fd.get('startTime'),
        endTime: fd.get('endTime'),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { message?: string };
      setError(j.message ?? 'Failed to add slot');
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
          <Input type="date" name="date" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Start time</label>
          <Input type="time" name="startTime" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">End time</label>
          <Input type="time" name="endTime" required />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" loading={loading}>
          Add slot
        </Button>
        {error && (
          <span className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle size={14} /> {error}
          </span>
        )}
      </div>
    </form>
  );
}
