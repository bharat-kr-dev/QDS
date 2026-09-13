import type { Metadata } from 'next';
import './globals.css';
import { QuantumProvider } from '../lib/experiments/experiment-store';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';

export const metadata: Metadata = {
  title: 'Teleportation-Based Quantum Digital Signature (QDS) Simulator & Threat Detection Platform',
  description:
    'Interactive research-grade simulation environment for quantum digital signatures, Bell state teleportation, Pauli corrections, and quantum threat detection.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
        <QuantumProvider>
          <AppHeader />
          <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-57px)]">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </QuantumProvider>
      </body>
    </html>
  );
}
