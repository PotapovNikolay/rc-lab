'use client';

import { QueuePanel } from '@/features/queue/components/QueuePanel';
import { GeneratePresetsPanel } from '@/features/generate/components/GeneratePresetsPanel';
import {
  GeneratePageProvider,
  useGeneratePageContext,
} from '@/features/generate/context/GeneratePageContext';
import { GenerateWizardPanel } from '@/features/wizard/components/GenerateWizardPanel';

function GeneratePageContent() {
  const { queuePanelModel } = useGeneratePageContext();

  return (
    <div className="space-y-6 h-full">
      <GeneratePresetsPanel />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr] h-full items-start">
        <GenerateWizardPanel />

        <div className="h-full">
          <QueuePanel model={queuePanelModel} />
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <GeneratePageProvider>
      <GeneratePageContent />
    </GeneratePageProvider>
  );
}
