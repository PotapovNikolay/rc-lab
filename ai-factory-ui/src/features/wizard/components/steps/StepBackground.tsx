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
import { Plus } from 'lucide-react';
import { useWizardStore } from '@/stores/wizardStore';
import { useLibrary } from '@/shared/hooks';
import { toast } from 'sonner';

const BACKGROUND_CATEGORIES = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  studio: 'Studio',
  other: 'Other',
} as const;

function getBackgroundCategory(backgroundId: string): keyof typeof BACKGROUND_CATEGORIES {
  const id = backgroundId.toLowerCase();
  if (id.includes('indoor') || id.includes('room') || id.includes('interior') ||
      id.includes('bedroom') || id.includes('kitchen') || id.includes('office')) return 'indoor';
  if (id.includes('outdoor') || id.includes('forest') || id.includes('beach') ||
      id.includes('street') || id.includes('park') || id.includes('garden') ||
      id.includes('nature') || id.includes('sky')) return 'outdoor';
  if (id.includes('studio') || id.includes('simple') || id.includes('white') ||
      id.includes('backdrop') || id.includes('plain')) return 'studio';
  return 'other';
}

export function StepBackground() {
  const backgrounds = useWizardStore((state) => state.backgrounds);
  const toggleBackground = useWizardStore((state) => state.toggleBackground);
  const backgroundsQuery = useLibrary<SimpleComponent>('backgrounds');
  const backgroundEntries = useMemo(
    () => Object.entries(backgroundsQuery.data ?? {}),
    [backgroundsQuery.data]
  );

  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'indoor', 'outdoor', 'studio'
  ]);

  const groupedBackgrounds = useMemo(() => {
    const groups: Record<string, Array<[string, SimpleComponent]>> = {};
    Object.keys(BACKGROUND_CATEGORIES).forEach(category => {
      groups[category] = [];
    });
    backgroundEntries.forEach((entry) => {
      const category = getBackgroundCategory(entry[0]);
      groups[category].push(entry);
    });
    return Object.entries(groups).filter(([_, entries]) => entries.length > 0);
  }, [backgroundEntries]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Quick add for backgrounds coming soon')}
          className="border-teal-500/70 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Background
        </Button>
      </div>

      {groupedBackgrounds.length > 0 ? (
        <Accordion
          type="multiple"
          value={expandedCategories}
          onValueChange={setExpandedCategories}
          className="space-y-2"
        >
          {groupedBackgrounds.map(([categoryKey, entries]) => (
            <AccordionItem
              key={categoryKey}
              value={categoryKey}
              className="rounded-lg border border-slate-700 bg-slate-900/50 px-4"
            >
              <AccordionTrigger className="text-sm font-medium text-slate-200 hover:text-teal-400 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>{BACKGROUND_CATEGORIES[categoryKey as keyof typeof BACKGROUND_CATEGORIES]}</span>
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                    {entries.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2">
                <SelectionGrid
                  model={{
                    entries,
                    selectedIds: backgrounds,
                    onToggle: toggleBackground,
                    emptyText: 'No backgrounds in this category.',
                    multiSelect: true,
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-sm text-slate-400">No backgrounds loaded.</p>
      )}
    </div>
  );
}
