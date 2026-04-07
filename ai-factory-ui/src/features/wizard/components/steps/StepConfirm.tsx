import { Button } from '@/shared/ui/button';
import { Slider } from '@/shared/ui/slider';
import { useWizardStore } from '@/stores/wizardStore';
import { useLibrary } from '@/shared/hooks';
import { Character, SimpleComponent, Style } from '@/core/types';
import { useMemo } from 'react';
import { useGeneratePageContext } from '@/features/generate/context/GeneratePageContext';

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-800 last:border-0">
      <span className="text-xs uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-300 text-right">{value}</span>
    </div>
  );
}

type StatBoxProps = {
  label: string;
  value: string | number;
};

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-200">{value}</p>
    </div>
  );
}

const getDictionaryName = <T extends { name: string }>(
  dictionary: Record<string, T> | undefined,
  id: string
) => dictionary?.[id]?.name ?? id;

const listNames = <T extends { name: string }>(ids: string[], dict?: Record<string, T>) =>
  ids.map((id) => getDictionaryName(dict, id)).join(', ') || '-';

export function StepConfirm() {
  const { wizardPanelModel } = useGeneratePageContext();
  const { onAddToQueue, onAddAndRun, isSavingQueue, isStarting, isRunning } =
    wizardPanelModel;

  const style = useWizardStore((state) => state.style);
  const character = useWizardStore((state) => state.character);
  const outfitMode = useWizardStore((state) => state.outfitMode);
  const outfits = useWizardStore((state) => state.outfits);
  const cameras = useWizardStore((state) => state.cameras);
  const poses = useWizardStore((state) => state.poses);
  const expressions = useWizardStore((state) => state.expressions);
  const backgrounds = useWizardStore((state) => state.backgrounds);
  const draftsPerCombination = useWizardStore((state) => state.draftsPerCombination);
  const setDraftsPerCombination = useWizardStore(
    (state) => state.setDraftsPerCombination
  );

  const stylesQuery = useLibrary<Style>('styles');
  const charactersQuery = useLibrary<Character>('characters');
  const outfitsQuery = useLibrary<SimpleComponent>('outfits');
  const camerasQuery = useLibrary<SimpleComponent>('cameras');
  const posesQuery = useLibrary<SimpleComponent>('poses');
  const expressionsQuery = useLibrary<SimpleComponent>('expressions');
  const backgroundsQuery = useLibrary<SimpleComponent>('backgrounds');

  const currentOutfitCount = useMemo(() => {
    if (outfitMode === 'default' || outfitMode === 'none') return 1;
    return outfits.length;
  }, [outfitMode, outfits.length]);

  const currentCombinations =
    currentOutfitCount *
    cameras.length *
    poses.length *
    expressions.length *
    backgrounds.length;
  const currentImages = currentCombinations * draftsPerCombination;

  const canAddCurrentJob =
    Boolean(style && character) &&
    (outfitMode !== 'select' || outfits.length > 0) &&
    cameras.length > 0 &&
    poses.length > 0 &&
    expressions.length > 0 &&
    backgrounds.length > 0;

  const buildOutfitSummary = () => {
    if (outfitMode === 'default') return 'default';
    if (outfitMode === 'none') return 'none';
    return listNames(outfits, outfitsQuery.data);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-1 px-4">
        <SummaryRow
          label="Style"
          value={style ? getDictionaryName(stylesQuery.data, style) : '-'}
        />
        <SummaryRow
          label="Character"
          value={
            character
              ? getDictionaryName(charactersQuery.data, character)
              : '-'
          }
        />
        <SummaryRow label="Outfit" value={buildOutfitSummary()} />
        <SummaryRow label="Camera" value={listNames(cameras, camerasQuery.data)} />
        <SummaryRow label="Pose" value={listNames(poses, posesQuery.data)} />
        <SummaryRow
          label="Expression"
          value={listNames(expressions, expressionsQuery.data)}
        />
        <SummaryRow
          label="Background"
          value={listNames(backgrounds, backgroundsQuery.data)}
        />
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-widest text-slate-400">Drafts per combination</label>
          <span className="text-sm font-bold text-teal-400">{draftsPerCombination}</span>
        </div>
        <Slider
          min={1}
          max={5}
          step={1}
          value={[draftsPerCombination]}
          onValueChange={(values) => setDraftsPerCombination(values[0])}
          className="py-4"
        />
      </div>

      <div className="grid gap-2 grid-cols-3">
        <StatBox label="Combinations" value={currentCombinations} />
        <StatBox label="Images" value={currentImages} />
        <StatBox label="ETA min" value={Math.ceil(currentImages * 0.5)} />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onAddToQueue}
          disabled={!canAddCurrentJob}
          className="flex-1 bg-sky-600 hover:bg-sky-700 text-white"
        >
          Add To Queue
        </Button>
        <Button
          onClick={onAddAndRun}
          disabled={!canAddCurrentJob || isSavingQueue || isStarting || isRunning}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
        >
          Add And Run
        </Button>
      </div>
    </div>
  );
}
