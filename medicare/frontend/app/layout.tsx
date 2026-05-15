import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'MedRDV — Online Medical Appointments',
    template: '%s · MedRDV',
  },
  description: 'Book appointments with verified doctors online. Fast, secure, and free.',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="min-h-screen antialiased">
        <div className="animate-fade-in">{children}</div>
      </body>
    </html>
  );
}
