import { QueueJobCard } from './QueueJobCard';
import { QueuePanelModel } from '../types';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Badge } from '@/shared/ui/badge';
import { Play, Square, Save, Trash2, RefreshCcw } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type QueuePanelProps = {
  model: QueuePanelModel;
};

export function QueuePanel({ model }: QueuePanelProps) {
  return (
    <aside className="flex flex-col h-full space-y-4 rounded-2xl border border-slate-700 bg-slate-900/40 p-6 backdrop-blur-sm">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">Queue Panel</p>
          <p className="mt-1 text-sm text-slate-300">
            <span className="font-bold text-teal-400">{model.queue.length}</span> jobs | <span className="font-bold text-teal-400">{model.queueImages}</span> images
          </p>
          <p className="text-[11px] text-slate-500">~{model.queueEtaMinutes} min estimated</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={model.onLoadApiQueue}
          className="h-8 border-slate-700 bg-slate-800/50 text-xs hover:bg-slate-700"
        >
          <RefreshCcw className="mr-2 h-3 w-3" />
          Sync
        </Button>
      </header>

      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="space-y-3">
          {model.queue.map((job, index) => (
            <QueueJobCard key={`${job.style}-${job.character}-${index}`} model={model} job={job} index={index} />
          ))}
          {model.queue.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-slate-800/50 p-3 mb-3">
                <Trash2 className="h-6 w-6 text-slate-600" />
              </div>
              <p className="text-sm text-slate-500">Queue is empty</p>
              <p className="mt-1 text-[11px] text-slate-600">Build jobs in the wizard</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="pt-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Status</span>
          <Badge 
            variant={model.generationStatus === 'running' ? 'default' : 'secondary'}
            className={cn(
              "capitalize",
              model.generationStatus === 'running' && "bg-teal-500 text-white"
            )}
          >
            {model.generationStatus ?? 'idle'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={model.onSaveQueue} 
            disabled={model.queue.length === 0 || model.isSavingQueue}
            variant="outline"
            className="border-sky-500/50 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs h-9"
          >
            <Save className="mr-2 h-3.5 w-3.5" />
            {model.isSavingQueue ? 'Saving...' : 'Save API'}
          </Button>
          <Button 
            onClick={model.onClearQueue} 
            disabled={model.queue.length === 0}
            variant="outline"
            className="border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-700 text-xs h-9"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Clear
          </Button>
        </div>

        <Button 
          onClick={model.onRunQueue} 
          disabled={model.queue.length === 0 || model.isRunning || model.isSavingQueue || model.isStarting}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-10"
        >
          {model.isStarting ? (
            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {model.isStarting ? 'Starting...' : 'Run Generation'}
        </Button>

        {model.isRunning && (
          <Button 
            onClick={model.onStopGeneration} 
            disabled={model.isStopping}
            variant="destructive"
            className="w-full h-10 font-bold"
          >
            {model.isStopping ? (
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Square className="mr-2 h-4 w-4" />
            )}
            {model.isStopping ? 'Stopping...' : 'Stop Generation'}
          </Button>
        )}
      </div>
    </aside>
  );
}
