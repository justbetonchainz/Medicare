'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

export function CancelButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onConfirm = async (): Promise<void> => {
    setLoading(true);
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <XCircle size={13} /> Cancel
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Cancel appointment">
        <p className="text-sm text-slate-600">
          Are you sure you want to cancel this appointment? The slot will become available again.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Keep it</Button>
          <Button variant="danger" size="sm" loading={loading} onClick={onConfirm}>
            Yes, cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
