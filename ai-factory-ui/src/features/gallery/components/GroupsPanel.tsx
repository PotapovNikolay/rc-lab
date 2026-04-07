import { Button } from '@/shared/ui/button';
import { GalleryGroup } from '../types';
import { cn } from '@/shared/lib/utils';

type SelectedGroup = {
  style: string;
  character: string;
};

type GalleryGroupsPanelProps = {
  groups: GalleryGroup[];
  activeGroup: SelectedGroup | null;
  isLoading: boolean;
  onSelectGroup: (group: SelectedGroup) => void;
};

export function GalleryGroupsPanel({
  groups,
  activeGroup,
  isLoading,
  onSelectGroup,
}: GalleryGroupsPanelProps) {
  return (
    <aside className="space-y-3 rounded-2xl border border-slate-700 bg-slate-900/40 p-5 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Groups</p>

      <div className="space-y-2">
        {groups.map((group) => {
          const selected =
            activeGroup?.style === group.style && activeGroup?.character === group.character;

          return (
            <Button
              key={`${group.style}-${group.character}`}
              variant={selected ? 'default' : 'outline'}
              onClick={() => onSelectGroup({ style: group.style, character: group.character })}
              className={cn(
                'w-full h-auto flex-col items-start px-4 py-3 text-left transition-all',
                selected
                  ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-500'
                  : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
              )}
            >
              <p className="text-sm font-bold truncate w-full">
                {group.style} / {group.character}
              </p>
              <p className={cn(
                "mt-1 text-xs",
                selected ? "text-teal-100/70" : "text-slate-500"
              )}>
                {group.count} images
              </p>
            </Button>
          );
        })}
      </div>

      {!isLoading && groups.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-500 italic">No groups found</p>
        </div>
      )}
    </aside>
  );
}
