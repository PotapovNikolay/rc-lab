import { SelectionGrid } from '@/shared/ui/selection-grid';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { useLibrary } from '@/shared/hooks';
import { SimpleComponent } from '@/core/types';
import { toast } from 'sonner';

export function StepExpression() {
  const expressions = useWizardStore((state) => state.expressions);
  const toggleExpression = useWizardStore((state) => state.toggleExpression);
  const expressionsQuery = useLibrary<SimpleComponent>('expressions');
  const expressionEntries = useMemo(
    () => Object.entries(expressionsQuery.data ?? {}),
    [expressionsQuery.data]
  );

  return (
    <SelectionGrid
      model={{
        entries: expressionEntries,
        selectedIds: expressions,
        onToggle: toggleExpression,
        emptyText: 'No expressions loaded.',
        multiSelect: true,
        actions: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Quick add for expressions coming soon')}
            className="border-teal-500/70 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Expression
          </Button>
        ),
      }}
    />
  );
}
