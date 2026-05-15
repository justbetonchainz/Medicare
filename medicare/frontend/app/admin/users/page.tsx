import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { serverApi } from '@/lib/server-api';
import type { User } from '@/types';
import { UserActions } from './UserActions';
import { CreateUserForm } from './CreateUserForm';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Users' };
export const dynamic = 'force-dynamic';

const ROLE_TONE: Record<string, 'info' | 'default' | 'warning'> = {
  patient: 'info',
  doctor: 'warning',
  admin: 'default',
};

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  let users: User[] = [];
  try {
    users = await serverApi.get<User[]>(
      `/users${searchParams.role ? `?role=${searchParams.role}` : ''}`,
    );
  } catch { /* empty */ }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="mt-0.5 text-sm text-slate-500">{users.length} user{users.length !== 1 ? 's' : ''} registered</p>
        </div>
        <CreateUserForm />
      </div>

      {/* Filter */}
      <form className="flex items-center gap-3" method="get">
        <select
          name="role"
          defaultValue={searchParams.role ?? ''}
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All roles</option>
          <option value="patient">Patients</option>
          <option value="doctor">Doctors</option>
          <option value="admin">Admins</option>
        </select>
        <button
          type="submit"
          className="h-9 rounded-lg bg-brand-600 text-white px-4 text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Filter
        </button>
        {searchParams.role && (
          <a href="/admin/users" className="text-sm text-slate-500 hover:text-slate-700 hover:underline">
            Clear
          </a>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="p-10">
            <EmptyState icon={Users} title="No users found" description="No users match the selected filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${u.firstName} ${u.lastName}`} />
                        <span className="font-medium text-slate-800">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <Badge tone={ROLE_TONE[u.role] ?? 'default'}>{u.role}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={u.isActive ? 'success' : 'danger'} dot>
                        {u.isActive ? 'active' : 'blocked'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <UserActions user={u} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
