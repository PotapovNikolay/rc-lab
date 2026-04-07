'use client';

import Link from 'next/link';
import { navItems } from '@/shared/layout/navConfig';

type AppShellMobileNavProps = {
  pathname: string;
};

export function AppShellMobileNav({ pathname }: AppShellMobileNavProps) {
  return (
    <nav className="sticky bottom-0 border-t border-slate-800/80 bg-slate-900/90 px-2 py-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center rounded-lg px-1 py-2 text-[11px] ${
                isActive ? 'text-teal-300' : 'text-slate-400'
              }`}
            >
              <Icon className="mb-1 h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
