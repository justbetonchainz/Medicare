'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

export function UserActions({ user }: { user: User }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const call = async (path: string, method: string): Promise<void> => {
    setBusy(true);
    await fetch(path, { method });
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="inline-flex gap-2">
      {user.isActive ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => call(`/api/proxy/users/${user.id}/block`, 'PATCH')}
          disabled={busy}
        >
          Block
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => call(`/api/proxy/users/${user.id}/unblock`, 'PATCH')}
          disabled={busy}
        >
          Unblock
        </Button>
      )}
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          if (confirm(`Delete user ${user.email}?`)) {
            void call(`/api/proxy/users/${user.id}`, 'DELETE');
          }
        }}
        disabled={busy}
      >
        Delete
      </Button>
    </div>
  );
}
