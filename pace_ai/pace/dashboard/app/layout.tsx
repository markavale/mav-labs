'use client';

import './globals.css';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { NotesPanel } from '@/components/layout/notes-panel';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" className="dark">
      <head>
        <title>Pace Dashboard</title>
        <meta name="description" content="Personal AI Cognitive Engine Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {isLoginPage ? (
          children
        ) : (
          <div className="min-h-screen bg-dark-bg">
            <Header
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              onNotesClick={() => setNotesOpen(!notesOpen)}
            />

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="lg:pl-64 pt-4 pb-8 px-4 lg:px-8">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>

            <NotesPanel isOpen={notesOpen} onClose={() => setNotesOpen(false)} />
          </div>
        )}
      </body>
    </html>
  );
}
