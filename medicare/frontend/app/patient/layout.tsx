import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { RoleSidebar } from '@/components/RoleSidebar';
import { getSession } from '@/lib/auth';

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== 'patient') redirect('/login');
  return (
    <>
      <Navbar session={session} />
      <div className="flex">
        <RoleSidebar role="patient" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </>
  );
}
