'use client';

import { HealthResponse } from '@/core/types';
import { pageTitles } from '@/shared/layout/navConfig';
import { StatusIndicator } from '@/shared/layout/StatusIndicator';

type AppShellHeaderProps = {
  pathname: string;
  health?: HealthResponse;
  generationStatus?: string;
};

export function AppShellHeader({ pathname, health, generationStatus }: AppShellHeaderProps) {
  const title = pageTitles[pathname] ?? 'AI Factory';
  const apiStatus = health ? (health.api === 'ok' ? 'ok' : 'error') : 'unknown';
  const comfyStatus = health ? (health.comfyui === 'ok' ? 'ok' : 'error') : 'unknown';

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/50 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            API queue: <span className="font-medium text-slate-200">{health?.comfyui_queue ?? 0}</span>
            {' '}| generation: <span className="font-medium text-slate-200">{generationStatus ?? 'idle'}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <StatusIndicator label="API" value={apiStatus === 'ok' ? 'Online' : 'Offline'} status={apiStatus} />
          <StatusIndicator label="ComfyUI" value={comfyStatus === 'ok' ? 'Ready' : 'Unavailable'} status={comfyStatus} />
        </div>
      </div>
    </header>
  );
}
