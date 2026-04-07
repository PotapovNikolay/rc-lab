'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  loadWizardPresets,
  saveWizardPresets,
  WizardPreset,
} from '@/features/wizard/lib/presetStorage';
import {
  useGenerationStatus,
  useLibrary,
  useQueue,
  useSaveQueue,
  useStartGeneration,
  useStopGeneration,
} from '@/shared/hooks';
import { getUiSettings } from '@/shared/lib/runtimeConfig';
import { Character, Job, QueueFile, Style } from '@/core/types';
import { useWizardStore } from '@/stores/wizardStore';
import type { QueuePanelModel } from '@/features/queue/types';

const countField = (value: string | string[]) =>
  Array.isArray(value) ? value.length : 1;

const buildQueueFile = (jobs: Job[], draftsPerCombination: number): QueueFile => ({
  preset_mode: false,
  settings: { drafts_per_combination: draftsPerCombination },
  jobs,
});

const getQueueCombinations = (jobs: Job[]) =>
  jobs.reduce((sum, job) => {
    return (
      sum +
      countField(job.outfit) *
        countField(job.camera) *
        countField(job.pose) *
        countField(job.expression) *
        countField(job.background)
    );
  }, 0);

const getName = <T extends { name: string }>(
  dictionary: Record<string, T> | undefined,
  id: string
) => dictionary?.[id]?.name ?? id;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createPresetId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `preset-${Date.now()}`;

type PresetsModel = {
  presets: WizardPreset[];
  selectedPresetId: string;
  presetName: string;
  canLoadPreset: boolean;
  onPresetSelect: (presetId: string) => void;
  onPresetNameChange: (name: string) => void;
  onCreateNewPreset: () => void;
  onSavePreset: () => void;
  onLoadPreset: () => void;
  onDeletePreset: () => void;
};

type WizardPanelModel = {
  onAddToQueue: () => void;
  onAddAndRun: () => void;
  isSavingQueue: boolean;
  isStarting: boolean;
  isRunning: boolean;
};

type GeneratePageController = {
  presetsModel: PresetsModel;
  wizardPanelModel: WizardPanelModel;
  queuePanelModel: QueuePanelModel;
};

export function useGeneratePageController(): GeneratePageController {
  const draftsPerCombination = useWizardStore((state) => state.draftsPerCombination);
  const queue = useWizardStore((state) => state.queue);
  const setQueue = useWizardStore((state) => state.setQueue);
  const setDraftsPerCombination = useWizardStore(
    (state) => state.setDraftsPerCombination
  );
  const addToQueue = useWizardStore((state) => state.addToQueue);
  const removeFromQueue = useWizardStore((state) => state.removeFromQueue);
  const reorderQueue = useWizardStore((state) => state.reorderQueue);
  const clearQueue = useWizardStore((state) => state.clearQueue);
  const capturePreset = useWizardStore((state) => state.capturePreset);
  const applyPreset = useWizardStore((state) => state.applyPreset);

  const stylesQuery = useLibrary<Style>('styles');
  const charactersQuery = useLibrary<Character>('characters');
  const queueQuery = useQueue();
  const generationQuery = useGenerationStatus();

  const saveQueueMutation = useSaveQueue();
  const startGenerationMutation = useStartGeneration();
  const stopGenerationMutation = useStopGeneration();

  const [draggedQueueIndex, setDraggedQueueIndex] = useState<number | null>(null);
  const [presets, setPresets] = useState<WizardPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [presetName, setPresetName] = useState('');
  const initializedFromApi = useRef(false);

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedPresetId),
    [presets, selectedPresetId]
  );

  useEffect(() => {
    setPresets(loadWizardPresets());
  }, []);

  useEffect(() => {
    if (!queueQuery.data || initializedFromApi.current) return;

    setQueue(queueQuery.data.jobs ?? []);
    setDraftsPerCombination(
      queueQuery.data.settings?.drafts_per_combination ?? getUiSettings().drafts
    );
    initializedFromApi.current = true;
  }, [queueQuery.data, setDraftsPerCombination, setQueue]);

  const prevStatusRef = useRef<string | undefined>();
  useEffect(() => {
    const currentStatus = generationQuery.data?.status;
    const prevStatus = prevStatusRef.current;

    if (prevStatus && currentStatus && prevStatus !== currentStatus) {
      if (currentStatus === 'completed') {
        toast.success('Generation completed successfully');
      } else if (currentStatus === 'error') {
        const errors = generationQuery.data?.errors || [];
        toast.error(`Generation failed${errors.length > 0 ? ': ' + errors[0] : ''}`);
      } else if (currentStatus === 'stopping') {
        toast.info('Stopping generation...');
      } else if (currentStatus === 'idle' && prevStatus === 'stopping') {
        toast.info('Generation stopped');
      }
    }

    prevStatusRef.current = currentStatus;
  }, [generationQuery.data?.status, generationQuery.data?.errors]);

  const queueCombinations = useMemo(() => getQueueCombinations(queue), [queue]);
  const queueImages = queueCombinations * draftsPerCombination;
  const queueEtaMinutes = Math.ceil(queueImages * 0.5);

  const isRunning = generationQuery.data?.status === 'running';
  const isSavingQueue = saveQueueMutation.isPending;
  const isStarting = startGenerationMutation.isPending;

  const persistQueue = async (jobs: Job[]) => {
    await saveQueueMutation.mutateAsync(buildQueueFile(jobs, draftsPerCombination));
  };

  const handleSaveQueue = async () => {
    if (queue.length === 0) return;
    try {
      await persistQueue(queue);
      await queueQuery.refetch();
      toast.success('Queue saved successfully');
    } catch {
      toast.error('Failed to save queue');
    }
  };

  const handleRunQueue = async () => {
    if (queue.length === 0) return;
    try {
      await persistQueue(queue);
      await startGenerationMutation.mutateAsync();
      toast.success(`Generation started: ${queueImages} images`);
      await delay(getUiSettings().cooldown * 1000);
      await generationQuery.refetch();
    } catch {
      toast.error('Failed to start generation');
    }
  };

  const handleAddToQueue = () => {
    const before = useWizardStore.getState().queue.length;
    addToQueue();
    const nextQueue = useWizardStore.getState().queue;
    if (nextQueue.length > before) {
      toast.success('Job added to queue');
    }
  };

  const handleAddAndRun = async () => {
    const before = useWizardStore.getState().queue.length;
    addToQueue();
    const updatedQueue = useWizardStore.getState().queue;
    if (updatedQueue.length === before) return;

    try {
      await persistQueue(updatedQueue);
      await startGenerationMutation.mutateAsync();
      const totalImages = getQueueCombinations(updatedQueue) * draftsPerCombination;
      toast.success(`Generation started: ${totalImages} images`);
      await delay(getUiSettings().cooldown * 1000);
      await generationQuery.refetch();
    } catch {
      toast.error('Failed to start generation');
    }
  };

  const handleLoadQueueFromApi = () => {
    if (!queueQuery.data) return;
    setQueue(queueQuery.data.jobs ?? []);
    setDraftsPerCombination(queueQuery.data.settings?.drafts_per_combination ?? 1);
  };

  const persistPresets = (nextPresets: WizardPreset[]) => {
    setPresets(nextPresets);
    saveWizardPresets(nextPresets);
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = presets.find((item) => item.id === presetId);
    setPresetName(preset?.name ?? '');
  };

  const handleSavePreset = () => {
    const name = presetName.trim();
    if (!name) {
      toast.error('Preset name is required');
      return;
    }

    const payload = capturePreset();
    const now = new Date().toISOString();
    const matchByName = presets.find(
      (preset) => preset.name.toLowerCase() === name.toLowerCase()
    );
    const existing = selectedPreset ?? matchByName;

    if (existing) {
      const updatedPresets = presets.map((preset) =>
        preset.id === existing.id
          ? {
              ...preset,
              name,
              updatedAt: now,
              payload,
            }
          : preset
      );
      persistPresets(updatedPresets);
      setSelectedPresetId(existing.id);
      toast.success(`Preset "${name}" updated`);
      return;
    }

    const newPreset: WizardPreset = {
      id: createPresetId(),
      name,
      createdAt: now,
      updatedAt: now,
      payload,
    };

    const nextPresets = [...presets, newPreset];
    persistPresets(nextPresets);
    setSelectedPresetId(newPreset.id);
    toast.success(`Preset "${name}" saved`);
  };

  const handleLoadPreset = () => {
    if (!selectedPreset) {
      toast.error('Select a preset first');
      return;
    }

    applyPreset(selectedPreset.payload);
    toast.success(`Preset "${selectedPreset.name}" loaded`);
  };

  const handleDeletePreset = () => {
    if (!selectedPreset) {
      toast.error('Select a preset first');
      return;
    }

    const nextPresets = presets.filter((preset) => preset.id !== selectedPreset.id);
    persistPresets(nextPresets);
    setSelectedPresetId('');
    setPresetName('');
    toast.success(`Preset "${selectedPreset.name}" deleted`);
  };

  return {
    presetsModel: {
      presets,
      selectedPresetId,
      presetName,
      canLoadPreset: Boolean(selectedPreset),
      onPresetSelect: handlePresetSelect,
      onPresetNameChange: setPresetName,
      onCreateNewPreset: () => {
        setSelectedPresetId('');
        setPresetName('');
      },
      onSavePreset: handleSavePreset,
      onLoadPreset: handleLoadPreset,
      onDeletePreset: handleDeletePreset,
    },
    wizardPanelModel: {
      onAddToQueue: handleAddToQueue,
      onAddAndRun: () => {
        void handleAddAndRun();
      },
      isSavingQueue,
      isStarting,
      isRunning,
    },
    queuePanelModel: {
      queue,
      queueImages,
      queueEtaMinutes,
      draggedQueueIndex,
      isSavingQueue,
      isRunning,
      isStarting,
      isStopping: stopGenerationMutation.isPending,
      generationStatus: generationQuery.data?.status,
      getStyleName: (id) => getName(stylesQuery.data, id),
      getCharacterName: (id) => getName(charactersQuery.data, id),
      onDragStart: setDraggedQueueIndex,
      onDragEnd: () => setDraggedQueueIndex(null),
      onDropAt: (index) => {
        if (draggedQueueIndex === null) return;
        reorderQueue(draggedQueueIndex, index);
        setDraggedQueueIndex(null);
      },
      onMoveUp: (index) => reorderQueue(index, index - 1),
      onMoveDown: (index) => reorderQueue(index, index + 1),
      onRemove: removeFromQueue,
      onLoadApiQueue: handleLoadQueueFromApi,
      onSaveQueue: () => {
        void handleSaveQueue();
      },
      onRunQueue: () => {
        void handleRunQueue();
      },
      onStopGeneration: () => stopGenerationMutation.mutate(),
      onClearQueue: clearQueue,
    },
  };
}
