import { useMemo, useState } from 'react';
import { SelectionGrid } from '@/shared/ui/selection-grid';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/accordion';
import { SimpleComponent } from '@/core/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Plus } from 'lucide-react';
import { useWizardStore } from '@/stores/wizardStore';
import { useLibrary } from '@/shared/hooks';
import { toast } from 'sonner';

const POSE_CATEGORIES = {
  hands: 'Hands',
  arms: 'Arms',
  standing: 'Standing',
  sitting: 'Sitting',
  lying: 'Lying',
  suggestive: 'Suggestive',
  effects: 'Effects',
  other: 'Other',
} as const;

function getPoseCategory(poseId: string): keyof typeof POSE_CATEGORIES {
  const id = poseId.toLowerCase();
  if (id.includes('hand') || id.includes('fist') || id.includes('finger')) return 'hands';
  if (id.includes('arm') || id.includes('raised')) return 'arms';
  if (id.includes('stand') || id.includes('upright')) return 'standing';
  if (id.includes('sit') || id.includes('seated')) return 'sitting';
  if (id.includes('lying') || id.includes('laying') || id.includes('prone')) return 'lying';
  if (id.includes('suggest') || id.includes('seduct') || id.includes('provocative')) return 'suggestive';
  if (id.includes('glow') || id.includes('effect') || id.includes('aura')) return 'effects';
  return 'other';
}

export function StepPose() {
  const poses = useWizardStore((state) => state.poses);
  const togglePose = useWizardStore((state) => state.togglePose);
  const selectRandomPoses = useWizardStore((state) => state.selectRandomPoses);
  const posesQuery = useLibrary<SimpleComponent>('poses');
  const poseEntries = useMemo(
    () => Object.entries(posesQuery.data ?? {}),
    [posesQuery.data]
  );

  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'hands', 'arms', 'standing'
  ]);

  const groupedPoses = useMemo(() => {
    const groups: Record<string, Array<[string, SimpleComponent]>> = {};
    Object.keys(POSE_CATEGORIES).forEach(category => {
      groups[category] = [];
    });
    poseEntries.forEach((entry) => {
      const category = getPoseCategory(entry[0]);
      groups[category].push(entry);
    });
    return Object.entries(groups).filter(([_, entries]) => entries.length > 0);
  }, [poseEntries]);

  const allPoseIds = useMemo(() =>
    poseEntries.map(([id]) => id),
    [poseEntries]
  );

  const handleSelectAll = () => {
    allPoseIds.forEach(id => {
      if (!poses.includes(id)) {
        togglePose(id);
      }
    });
  };

  const handleDeselectAll = () => {
    poses.forEach(id => {
      togglePose(id);
    });
  };

  const allSelected = allPoseIds.length > 0 && allPoseIds.every(id => poses.includes(id));
  const [randomPoseCount, setRandomPoseCount] = useState(5);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={allSelected ? handleDeselectAll : handleSelectAll}
          className="border-teal-500/70 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </Button>
        <div className="mx-2 h-4 w-px bg-slate-600" />
        <label className="text-xs uppercase tracking-[0.12em] text-slate-400">Random poses</label>
        <Input
          type="number"
          min={1}
          max={Math.max(1, poseEntries.length)}
          value={randomPoseCount}
          onChange={(event) => setRandomPoseCount(Number(event.target.value))}
          className="w-20 h-8 bg-slate-950 border-slate-600"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => selectRandomPoses(randomPoseCount, allPoseIds)}
          className="border-teal-500/70 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30"
        >
          Select Random
        </Button>
        <div className="mx-2 h-4 w-px bg-slate-600" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Quick add for poses coming soon')}
          className="border-teal-500/70 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Pose
        </Button>
      </div>

      {groupedPoses.length > 0 ? (
        <Accordion
          type="multiple"
          value={expandedCategories}
          onValueChange={setExpandedCategories}
          className="space-y-2"
        >
          {groupedPoses.map(([categoryKey, entries]) => (
            <AccordionItem
              key={categoryKey}
              value={categoryKey}
              className="rounded-lg border border-slate-700 bg-slate-900/50 px-4"
            >
              <AccordionTrigger className="text-sm font-medium text-slate-200 hover:text-teal-400 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>{POSE_CATEGORIES[categoryKey as keyof typeof POSE_CATEGORIES]}</span>
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                    {entries.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2">
                <SelectionGrid
                  model={{
                    entries,
                    selectedIds: poses,
                    onToggle: togglePose,
                    emptyText: 'No poses in this category.',
                    multiSelect: true,
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-sm text-slate-400">No poses loaded.</p>
      )}
    </div>
  );
}
