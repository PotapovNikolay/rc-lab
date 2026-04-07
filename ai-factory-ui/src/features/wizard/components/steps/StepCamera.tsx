import { SelectionGrid } from '@/shared/ui/selection-grid';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { useLibrary } from '@/shared/hooks';
import { SimpleComponent } from '@/core/types';
import { toast } from 'sonner';

export function StepCamera() {
  const cameras = useWizardStore((state) => state.cameras);
  const toggleCamera = useWizardStore((state) => state.toggleCamera);
  const camerasQuery = useLibrary<SimpleComponent>('cameras');
  const cameraEntries = useMemo(
    () => Object.entries(camerasQuery.data ?? {}),
    [camerasQuery.data]
  );

  const toggleAllCameras = () => {
    const ids = cameraEntries.map(([id]) => id);
    const everySelected = ids.every((id) => cameras.includes(id));
    ids.forEach((id) => {
      const isSelected = cameras.includes(id);
      if ((everySelected && isSelected) || (!everySelected && !isSelected)) {
        toggleCamera(id);
      }
    });
  };

  return (
    <SelectionGrid
      model={{
        entries: cameraEntries,
        selectedIds: cameras,
        onToggle: toggleCamera,
        emptyText: 'No cameras loaded.',
        multiSelect: true,
        actions: (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllCameras}
              className="border-slate-600 text-slate-200"
            >
              Toggle All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Quick add for cameras coming soon')}
              className="border-teal-500/70 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Camera
            </Button>
          </div>
        ),
      }}
    />
  );
}
