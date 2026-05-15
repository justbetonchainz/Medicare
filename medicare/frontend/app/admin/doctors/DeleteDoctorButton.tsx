'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function DeleteDoctorButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onClick = async (): Promise<void> => {
    if (!confirm('Delete this doctor?')) return;
    setLoading(true);
    await fetch(`/api/proxy/doctors/${id}`, { method: 'DELETE' });
    setLoading(false);
    router.refresh();
  };
  return (
    <Button variant="danger" size="sm" onClick={onClick} disabled={loading}>
      {loading ? '…' : 'Delete'}
    </Button>
  );
}
