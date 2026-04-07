'use client';

import { create } from 'zustand';
import { Job } from '@/core/types';

type OutfitMode = 'default' | 'none' | 'select';

type Estimate = {
  totalJobs: number;
  totalCombinations: number;
  totalImages: number;
};

type WizardState = {
  step: number;
  style: string | null;
  character: string | null;
  outfitMode: OutfitMode;
  outfits: string[];
  cameras: string[];
  poses: string[];
  expressions: string[];
  backgrounds: string[];
  draftsPerCombination: number;
  queue: Job[];
};

export type WizardPresetPayload = {
  style: string | null;
  character: string | null;
  outfitMode: OutfitMode;
  outfits: string[];
  cameras: string[];
  poses: string[];
  expressions: string[];
  backgrounds: string[];
  draftsPerCombination: number;
};

type WizardActions = {
  setStep: (step: number) => void;
  setStyle: (id: string | null) => void;
  setCharacter: (id: string | null) => void;
  setOutfitMode: (mode: OutfitMode) => void;
  setDraftsPerCombination: (value: number) => void;
  setQueue: (jobs: Job[]) => void;
  loadJobToWizard: (job: Job) => void;
  toggleOutfit: (id: string) => void;
  toggleCamera: (id: string) => void;
  togglePose: (id: string) => void;
  toggleExpression: (id: string) => void;
  toggleBackground: (id: string) => void;
  selectRandomPoses: (count: number, availablePoses: string[]) => void;
  addToQueue: () => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  resetWizard: () => void;
  getEstimate: () => Estimate;
  capturePreset: () => WizardPresetPayload;
  applyPreset: (preset: WizardPresetPayload) => void;
};

type WizardStore = WizardState & WizardActions;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const toggleItem = (list: string[], id: string): string[] =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

const toJobField = (values: string[]): string | string[] => {
  if (values.length === 0) return '';
  if (values.length === 1) return values[0];
  return values;
};

const ensureArray = (value: string | string[]): string[] =>
  Array.isArray(value) ? value : [value];

const uniqueValues = (values: string[]) => Array.from(new Set(values));

const normalizePreset = (preset: WizardPresetPayload): WizardPresetPayload => {
  const normalizedOutfitMode: OutfitMode =
    preset.outfitMode === 'none'
      ? 'none'
      : preset.outfitMode === 'select'
        ? 'select'
        : 'default';

  return {
    style: preset.style ?? null,
    character: preset.character ?? null,
    outfitMode: normalizedOutfitMode,
    outfits:
      normalizedOutfitMode === 'select'
        ? uniqueValues(preset.outfits ?? [])
        : [],
    cameras: uniqueValues(preset.cameras ?? []),
    poses: uniqueValues(preset.poses ?? []),
    expressions: uniqueValues(preset.expressions ?? []),
    backgrounds: uniqueValues(preset.backgrounds ?? []),
    draftsPerCombination: clamp(preset.draftsPerCombination ?? 1, 1, 5),
  };
};

const getJobCombinations = (job: Job): number => {
  const outfitCount = Array.isArray(job.outfit) ? job.outfit.length : 1;
  const cameraCount = Array.isArray(job.camera) ? job.camera.length : 1;
  const poseCount = Array.isArray(job.pose) ? job.pose.length : 1;
  const expressionCount = Array.isArray(job.expression) ? job.expression.length : 1;
  const backgroundCount = Array.isArray(job.background) ? job.background.length : 1;

  return outfitCount * cameraCount * poseCount * expressionCount * backgroundCount;
};

export const useWizardStore = create<WizardStore>((set, get) => ({
  step: 1,
  style: null,
  character: null,
  outfitMode: 'default',
  outfits: [],
  cameras: [],
  poses: [],
  expressions: [],
  backgrounds: [],
  draftsPerCombination: 1,
  queue: [],

  setStep: (step) => set({ step: clamp(step, 1, 8) }),
  setStyle: (style) => set({ style }),
  setCharacter: (character) => set({ character }),
  setOutfitMode: (outfitMode) =>
    set({
      outfitMode,
      outfits: outfitMode === 'select' ? get().outfits : [],
    }),
  setDraftsPerCombination: (draftsPerCombination) =>
    set({ draftsPerCombination: clamp(draftsPerCombination, 1, 5) }),
  setQueue: (queue) => set({ queue }),
  loadJobToWizard: (job) => {
    const outfitValues = ensureArray(job.outfit);
    const outfitValue = outfitValues[0] ?? 'default';

    const outfitMode: OutfitMode =
      outfitValue === 'default'
        ? 'default'
        : outfitValue === 'none'
          ? 'none'
          : 'select';

    set({
      step: 8,
      style: job.style,
      character: job.character,
      outfitMode,
      outfits: outfitMode === 'select' ? outfitValues : [],
      cameras: ensureArray(job.camera),
      poses: ensureArray(job.pose),
      expressions: ensureArray(job.expression),
      backgrounds: ensureArray(job.background),
    });
  },

  toggleOutfit: (id) => set((state) => ({ outfits: toggleItem(state.outfits, id) })),
  toggleCamera: (id) => set((state) => ({ cameras: toggleItem(state.cameras, id) })),
  togglePose: (id) => set((state) => ({ poses: toggleItem(state.poses, id) })),
  toggleExpression: (id) =>
    set((state) => ({ expressions: toggleItem(state.expressions, id) })),
  toggleBackground: (id) =>
    set((state) => ({ backgrounds: toggleItem(state.backgrounds, id) })),

  selectRandomPoses: (count, availablePoses) => {
    const safeCount = clamp(count, 0, availablePoses.length);
    const shuffled = [...availablePoses].sort(() => Math.random() - 0.5);
    set({ poses: shuffled.slice(0, safeCount) });
  },

  addToQueue: () => {
    const state = get();

    if (!state.style || !state.character) return;
    if (
      state.cameras.length === 0 ||
      state.poses.length === 0 ||
      state.expressions.length === 0 ||
      state.backgrounds.length === 0
    ) {
      return;
    }

    let outfit: string | string[];
    if (state.outfitMode === 'default') {
      outfit = 'default';
    } else if (state.outfitMode === 'none') {
      outfit = 'none';
    } else {
      if (state.outfits.length === 0) return;
      outfit = toJobField(state.outfits);
    }

    const job: Job = {
      style: state.style,
      character: state.character,
      outfit,
      camera: toJobField(state.cameras),
      pose: toJobField(state.poses),
      expression: toJobField(state.expressions),
      background: toJobField(state.backgrounds),
    };

    set((current) => ({
      queue: [...current.queue, job],
      step: 1,
      style: null,
      character: null,
      outfitMode: 'default',
      outfits: [],
      cameras: [],
      poses: [],
      expressions: [],
      backgrounds: [],
    }));
  },

  removeFromQueue: (index) =>
    set((state) => ({
      queue: state.queue.filter((_, currentIndex) => currentIndex !== index),
    })),

  reorderQueue: (from, to) =>
    set((state) => {
      if (
        from < 0 ||
        to < 0 ||
        from >= state.queue.length ||
        to >= state.queue.length ||
        from === to
      ) {
        return state;
      }

      const next = [...state.queue];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);

      return { queue: next };
    }),

  clearQueue: () => set({ queue: [] }),

  resetWizard: () =>
    set({
      step: 1,
      style: null,
      character: null,
      outfitMode: 'default',
      outfits: [],
      cameras: [],
      poses: [],
      expressions: [],
      backgrounds: [],
      draftsPerCombination: 1,
    }),

  getEstimate: () => {
    const state = get();
    const totalCombinations = state.queue.reduce(
      (sum, job) => sum + getJobCombinations(job),
      0
    );

    return {
      totalJobs: state.queue.length,
      totalCombinations,
      totalImages: totalCombinations * state.draftsPerCombination,
    };
  },

  capturePreset: () => {
    const state = get();
    return {
      style: state.style,
      character: state.character,
      outfitMode: state.outfitMode,
      outfits: [...state.outfits],
      cameras: [...state.cameras],
      poses: [...state.poses],
      expressions: [...state.expressions],
      backgrounds: [...state.backgrounds],
      draftsPerCombination: state.draftsPerCombination,
    };
  },

  applyPreset: (preset) => {
    const normalized = normalizePreset(preset);
    set({
      step: 8,
      style: normalized.style,
      character: normalized.character,
      outfitMode: normalized.outfitMode,
      outfits: normalized.outfits,
      cameras: normalized.cameras,
      poses: normalized.poses,
      expressions: normalized.expressions,
      backgrounds: normalized.backgrounds,
      draftsPerCombination: normalized.draftsPerCombination,
    });
  },
}));
