import { Job } from '@/core/types';
import { cn } from '@/shared/lib/utils';
import { QueuePanelModel } from '../types';
import { Button } from '@/shared/ui/button';
import { ArrowUp, ArrowDown, Trash2, GripVertical } from 'lucide-react';

const toArray = (value: string | string[]) => (Array.isArray(value) ? value : [value]);

type QueueJobCardProps = {
  model: QueuePanelModel;
  job: Job;
  index: number;
};

export function QueueJobCard({ model, job, index }: QueueJobCardProps) {
  return (
    <div
      draggable
      onDragStart={() => model.onDragStart(index)}
      onDragEnd={model.onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => model.onDropAt(index)}
      className={cn(
        'rounded-lg border border-slate-700 bg-slate-950/70 p-4 transition-all',
        model.draggedQueueIndex === index && 'border-teal-500/70 bg-teal-500/10 scale-[1.02] shadow-lg'
      )}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="h-4 w-4 mt-1 text-slate-600 cursor-grab active:cursor-grabbing" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-100 truncate">
            #{index + 1} {model.getStyleName(job.style)} / {model.getCharacterName(job.character)}
          </p>
          <p className="mt-1 text-xs text-slate-400 truncate">
            <span className="text-slate-500">outfit:</span> {toArray(job.outfit).join(', ')}
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            CAM: {toArray(job.camera).length} | POSE: {toArray(job.pose).length} | EXP: {toArray(job.expression).length} | BG: {toArray(job.background).length}
          </p>
        </div>
      </div>
      
      <div className="mt-3 flex gap-1.5 justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-400 hover:text-slate-200"
          onClick={() => model.onMoveUp(index)}
          disabled={index === 0}
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-400 hover:text-slate-200"
          onClick={() => model.onMoveDown(index)}
          disabled={index === model.queue.length - 1}
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10"
          onClick={() => model.onRemove(index)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
