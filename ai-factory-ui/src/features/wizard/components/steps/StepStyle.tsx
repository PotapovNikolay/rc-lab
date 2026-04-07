import { SelectionGrid } from '@/shared/ui/selection-grid';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { useLibrary } from '@/shared/hooks';
import { Style } from '@/core/types';
import { toast } from 'sonner';

export function StepStyle() {
  const style = useWizardStore((state) => state.style);
  const setStyle = useWizardStore((state) => state.setStyle);
  const stylesQuery = useLibrary<Style>('styles');
  const styleEntries = useMemo(
    () => Object.entries(stylesQuery.data ?? {}),
    [stylesQuery.data]
  );

  return (
    <SelectionGrid
      model={{
        entries: styleEntries,
        selectedIds: style ? [style] : [],
        onToggle: setStyle,
        emptyText: 'No styles loaded.',
        renderMeta: (item) => `${item.loras.length} loras`,
        actions: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Quick add for styles coming soon')}
            className="border-teal-500/70 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Style
          </Button>
        ),
      }}
    />
  );
}
