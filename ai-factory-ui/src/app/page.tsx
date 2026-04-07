'use client';

import Link from 'next/link';
import {
  useGenerationStatus,
  useHealth,
  useLibrary,
  useOutputList,
  useStopGeneration,
  useLatestImages,
} from '@/shared/hooks';
import { api } from '@/shared/api';
import { ProtectedApiImage } from '@/features/gallery/components/ProtectedApiImage';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { 
  Activity, 
  Database, 
  Layers, 
  PlayCircle, 
  Image as ImageIcon, 
  Settings, 
  Library,
  Clock,
  ChevronRight,
  StopCircle
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const formatEta = (seconds: number) => {
  if (!seconds || seconds <= 0) return 'N/A';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

function StatusCard({ title, value, icon: Icon, subValue, status }: any) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">{title}</p>
        <div className={cn(
          "p-2 rounded-lg",
          status === 'ok' ? "bg-teal-500/10 text-teal-400" : "bg-rose-500/10 text-rose-400"
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{subValue}</p>
    </div>
  );
}

function useDashboardPageView() {
  const { data: health } = useHealth();
  const { data: generation } = useGenerationStatus();
  const outputQuery = useOutputList();
  const output = outputQuery.data;
  const { data: styles } = useLibrary('styles');
  const { data: characters } = useLibrary('characters');
  const { data: latestImages } = useLatestImages(8, {
    enabled: outputQuery.isSuccess,
    staleTime: 30_000,
  });
  const stopGeneration = useStopGeneration();

  const progress = generation?.progress.percent ?? 0;
  const isRunning = generation?.status === 'running';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* System Status */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard 
          title="API Server" 
          value={health?.api === 'ok' ? 'Online' : 'Offline'} 
          icon={Activity}
          status={health?.api}
          subValue={`Filesystem: ${health?.filesystem ?? 'unknown'}`}
        />
        <StatusCard 
          title="ComfyUI" 
          value={health?.comfyui === 'ok' ? 'Ready' : 'Unavailable'} 
          icon={Database}
          status={health?.comfyui}
          subValue={`Free VRAM: ${health?.comfyui_memory?.free ?? 0} MB`}
        />
        <StatusCard 
          title="Queue" 
          value={health?.comfyui_queue ?? 0} 
          icon={Layers}
          status="ok"
          subValue="Jobs in ComfyUI queue"
        />
      </section>

      {/* Active Generation */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Active Task</p>
              {isRunning && <Badge className="bg-teal-500 animate-pulse">Running</Badge>}
            </div>
            <p className="text-xl font-bold text-slate-100 capitalize">
              {generation?.status ?? 'idle'}
            </p>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {generation?.progress.completed ?? 0} / {generation?.progress.total ?? 0}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ETA: {formatEta(generation?.eta_seconds ?? 0)}
              </span>
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            className="h-9 font-bold"
            onClick={() => stopGeneration.mutate()}
            disabled={!isRunning || stopGeneration.isPending}
          >
            <StopCircle className="mr-2 h-4 w-4" />
            {stopGeneration.isPending ? 'Stopping...' : 'Stop Generation'}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-800" />
        </div>
      </section>

      {/* Quick Actions & Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Quick Actions</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { href: '/generate', label: 'New Generation', icon: PlayCircle, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
              { href: '/gallery', label: 'Open Gallery', icon: ImageIcon, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
              { href: '/library', label: 'Edit Library', icon: Library, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
              { href: '/settings', label: 'Settings', icon: Settings, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-[1.02] active:scale-[0.98]",
                  action.bg, action.border
                )}
              >
                <action.icon className={cn("h-5 w-5", action.color)} />
                <span className="text-sm font-bold text-slate-100">{action.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Library Statistics</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Images', value: output?.total ?? 0, color: 'text-sky-400' },
              { label: 'Styles', value: styles ? Object.keys(styles).length : 0, color: 'text-teal-400' },
              { label: 'Characters', value: characters ? Object.keys(characters).length : 0, color: 'text-amber-400' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-slate-950/40 border border-slate-800 p-4 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                <p className={cn("text-2xl font-black", stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Latest Results */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Latest Results</p>
          <Link
            href="/gallery"
            className="text-[10px] uppercase tracking-widest font-black text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            View Gallery <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {latestImages && latestImages.length > 0 ? (
            latestImages.map((img) => (
              <Link
                key={`${img.style}-${img.character}-${img.filename}`}
                href={`/gallery?style=${encodeURIComponent(img.style)}&character=${encodeURIComponent(img.character)}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40 transition-all hover:border-teal-500/50 hover:scale-[1.05] hover:shadow-2xl hover:shadow-teal-500/20"
              >
                <ProtectedApiImage
                  url={api.getImageUrl(img.style, img.character, img.filename, true)}
                  alt={`${img.style} - ${img.character}`}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-[9px] font-black text-white truncate">
                      {img.character}
                    </p>
                    <p className="text-[8px] text-slate-400 truncate">
                      {img.style}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-sm text-slate-500 italic">No generated images yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return useDashboardPageView();
}
