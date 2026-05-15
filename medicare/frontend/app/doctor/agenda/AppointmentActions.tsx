'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { AppointmentStatus } from '@/types';

export function AppointmentActions({ id, status }: { id: string; status: AppointmentStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<AppointmentStatus | null>(null);

  if (status === 'cancelled' || status === 'completed') return null;

  const update = async (newStatus: AppointmentStatus): Promise<void> => {
    setBusy(true);
    setModal(null);
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setBusy(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex gap-2">
        {status === 'pending' && (
          <Button size="sm" variant="primary" loading={busy} onClick={() => setModal('confirmed')}>
            <CheckCircle2 size={13} /> Confirm
          </Button>
        )}
        {(status === 'pending' || status === 'confirmed') && (
          <>
            <Button size="sm" variant="secondary" loading={busy} onClick={() => setModal('completed')}>
              <CheckCheck size={13} /> Complete
            </Button>
            <Button size="sm" variant="danger" loading={busy} onClick={() => setModal('cancelled')}>
              <XCircle size={13} /> Cancel
            </Button>
          </>
        )}
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title="Confirm action"
      >
        <p className="text-sm text-slate-600">
          {modal === 'confirmed' && 'Mark this appointment as confirmed?'}
          {modal === 'completed' && 'Mark this appointment as completed?'}
          {modal === 'cancelled' && 'Cancel this appointment? The slot will be freed.'}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setModal(null)}>Back</Button>
          <Button
            size="sm"
            variant={modal === 'cancelled' ? 'danger' : 'primary'}
            loading={busy}
            onClick={() => modal && update(modal)}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </>
  );
}
