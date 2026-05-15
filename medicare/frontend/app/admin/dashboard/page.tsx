import { Users, Stethoscope, Calendar, Clock, Activity } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppointmentCard } from '@/components/AppointmentCard';
import { serverApi } from '@/lib/server-api';
import type { AdminStats } from '@/types';
import { SpecialtyChart } from './SpecialtyChart';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Admin Dashboard' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let stats: AdminStats | null = null;
  try {
    stats = await serverApi.get<AdminStats>('/dashboard/admin');
  } catch { /* empty */ }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400">
        Unable to load stats.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Platform overview and key metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard label="Total Users"    value={stats.totalUsers}        icon={Users}      tone="blue"   />
        <StatsCard label="Patients"       value={stats.totalPatients}     icon={Users}      tone="green"  />
        <StatsCard label="Doctors"        value={stats.totalDoctors}      icon={Stethoscope} tone="violet" />
        <StatsCard label="Appointments"   value={stats.totalAppointments} icon={Calendar}   tone="amber"  />
        <StatsCard label="Today"          value={stats.todayAppointments} icon={Clock}      tone="red"    />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={15} className="text-brand-600" />
              Doctors per specialty
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.perSpecialty.length > 0 ? (
              <SpecialtyChart data={stats.perSpecialty} />
            ) : (
              <p className="text-sm text-slate-400 py-8 text-center">No data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={15} className="text-brand-600" />
              Recent appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-72 overflow-y-auto">
            {stats.recentAppointments.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No appointments yet.</p>
            ) : (
              stats.recentAppointments.map((a) => (
                <AppointmentCard key={a.id} appointment={a} perspective="admin" />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
