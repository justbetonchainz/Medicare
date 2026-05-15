import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { RoleSidebar } from '@/components/RoleSidebar';
import { getSession } from '@/lib/auth';

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== 'doctor') redirect('/login');
  return (
    <>
      <Navbar session={session} />
      <div className="flex">
        <RoleSidebar role="doctor" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </>
  );
}
