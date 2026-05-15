'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BookButton({ availabilityId }: { availabilityId: string }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onBook = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityId, reason: reason || undefined }),
      });
      const json = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !json.success) throw new Error(json.message ?? 'Booking failed');
      router.push('/patient/appointments');
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <FileText size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="h-8 w-full rounded-lg border border-slate-200 pl-8 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <Button size="sm" className="w-full" onClick={onBook} loading={loading}>
        Book this slot
      </Button>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );
}
