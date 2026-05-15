'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function DeleteSlotButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onClick = async (): Promise<void> => {
    if (!confirm('Delete this slot?')) return;
    setLoading(true);
    await fetch(`/api/proxy/availabilities/${id}`, { method: 'DELETE' });
    setLoading(false);
    router.refresh();
  };
  return (
    <Button
      variant="danger"
      size="sm"
      className="mt-3"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? '…' : 'Delete'}
    </Button>
  );
}
