import { cn } from '@/shared/lib/utils';
import { SelectionGrid } from '@/shared/ui/selection-grid';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { useLibrary } from '@/shared/hooks';
import { Character, SimpleComponent } from '@/core/types';
import { toast } from 'sonner';

type ModeButtonProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

function ModeButton({ label, selected, onClick }: ModeButtonProps) {
  return (
    <Button
      variant={selected ? 'default' : 'outline'}
      onClick={onClick}
      className={cn(
        'w-full',
        selected
          ? 'bg-teal-600 hover:bg-teal-700'
          : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800'
      )}
    >
      {label}
    </Button>
  );
}

export function StepOutfit() {
  const characterId = useWizardStore((state) => state.character);
  const outfitMode = useWizardStore((state) => state.outfitMode);
  const outfits = useWizardStore((state) => state.outfits);
  const setOutfitMode = useWizardStore((state) => state.setOutfitMode);
  const toggleOutfit = useWizardStore((state) => state.toggleOutfit);
  const outfitsQuery = useLibrary<SimpleComponent>('outfits');
  const charactersQuery = useLibrary<Character>('characters');
  const outfitEntries = useMemo(
    () => Object.entries(outfitsQuery.data ?? {}),
    [outfitsQuery.data]
  );
  const selectedCharacter = characterId
    ? charactersQuery.data?.[characterId]
    : undefined;

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">
        <ModeButton
          label="Default Outfit"
          selected={outfitMode === 'default'}
          onClick={() => setOutfitMode('default')}
        />
        <ModeButton
          label="No Outfit"
          selected={outfitMode === 'none'}
          onClick={() => setOutfitMode('none')}
        />
        <ModeButton
          label="Select Outfit"
          selected={outfitMode === 'select'}
          onClick={() => setOutfitMode('select')}
        />
      </div>

      {outfitMode === 'default' && (
        <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-sm text-slate-300">
          {selectedCharacter
            ? `Default: ${selectedCharacter.default_outfit.positive}`
            : 'Select character first.'}
        </div>
      )}

      {outfitMode === 'select' && (
        <SelectionGrid
          model={{
            entries: outfitEntries,
            selectedIds: outfits,
            onToggle: toggleOutfit,
            emptyText: 'No outfits loaded.',
            actions: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('Quick add for outfits coming soon')}
                className="border-teal-500/70 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Outfit
              </Button>
            ),
          }}
        />
      )}
    </div>
  );
}
