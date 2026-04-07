import { SelectionGrid } from '@/shared/ui/selection-grid';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { useLibrary } from '@/shared/hooks';
import { Character } from '@/core/types';
import { toast } from 'sonner';

export function StepCharacter() {
  const character = useWizardStore((state) => state.character);
  const setCharacter = useWizardStore((state) => state.setCharacter);
  const charactersQuery = useLibrary<Character>('characters');
  const characterEntries = useMemo(
    () => Object.entries(charactersQuery.data ?? {}),
    [charactersQuery.data]
  );

  return (
    <SelectionGrid
      model={{
        entries: characterEntries,
        selectedIds: character ? [character] : [],
        onToggle: setCharacter,
        emptyText: 'No characters loaded.',
        renderMeta: (item) => item.source,
        actions: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Quick add for characters coming soon')}
            className="border-teal-500/70 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Character
          </Button>
        ),
      }}
    />
  );
}
