'use client';

import Link from 'next/link';
import { navItems } from '@/shared/layout/navConfig';

type AppShellSidebarProps = {
  pathname: string;
};

export function AppShellSidebar({ pathname }: AppShellSidebarProps) {
  return (
    <aside className="hidden w-72 flex-col border-r border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur md:flex">
      <div className="mb-8 rounded-2xl border border-slate-700/80 bg-slate-800/70 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-300">AI Factory v6</p>
        <p className="mt-2 text-lg font-semibold">Control Deck</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-teal-500/20 text-teal-200'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
