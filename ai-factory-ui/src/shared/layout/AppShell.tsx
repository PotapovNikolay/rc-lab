'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useGenerationStatus, useHealth } from '@/shared/hooks';
import { AppShellHeader } from '@/shared/layout/AppShellHeader';
import { AppShellSidebar } from '@/shared/layout/AppShellSidebar';
import { AppShellMobileNav } from '@/shared/layout/AppShellMobileNav';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { data: health } = useHealth();
  const { data: generation } = useGenerationStatus();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(20,184,166,0.25),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(249,115,22,0.22),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.2),transparent_45%)]" />
      <div className="relative z-10 flex min-h-screen">
        <AppShellSidebar pathname={pathname} />
        <div className="flex min-h-screen flex-1 flex-col">
          <AppShellHeader pathname={pathname} health={health} generationStatus={generation?.status} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          <AppShellMobileNav pathname={pathname} />
        </div>
      </div>
    </div>
  );
}
