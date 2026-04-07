'use client';

import { WizardPresetPayload } from '@/stores/wizardStore';

export const WIZARD_PRESETS_STORAGE_KEY = 'ai-factory-wizard-presets';

export type WizardPreset = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  payload: WizardPresetPayload;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const normalizePayload = (payload: unknown): WizardPresetPayload | null => {
  if (!isRecord(payload)) return null;

  const outfitMode = payload.outfitMode;
  const normalizedOutfitMode =
    outfitMode === 'none' ? 'none' : outfitMode === 'select' ? 'select' : 'default';

  return {
    style: typeof payload.style === 'string' ? payload.style : null,
    character: typeof payload.character === 'string' ? payload.character : null,
    outfitMode: normalizedOutfitMode,
    outfits: normalizedOutfitMode === 'select' ? toStringArray(payload.outfits) : [],
    cameras: toStringArray(payload.cameras),
    poses: toStringArray(payload.poses),
    expressions: toStringArray(payload.expressions),
    backgrounds: toStringArray(payload.backgrounds),
    draftsPerCombination: Number(payload.draftsPerCombination) || 1,
  };
};

const normalizePreset = (preset: unknown): WizardPreset | null => {
  if (!isRecord(preset)) return null;
  if (typeof preset.id !== 'string' || typeof preset.name !== 'string') return null;

  const payload = normalizePayload(preset.payload);
  if (!payload) return null;

  return {
    id: preset.id,
    name: preset.name,
    createdAt:
      typeof preset.createdAt === 'string'
        ? preset.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof preset.updatedAt === 'string'
        ? preset.updatedAt
        : new Date().toISOString(),
    payload,
  };
};

export const loadWizardPresets = (): WizardPreset[] => {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(WIZARD_PRESETS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizePreset)
      .filter((preset): preset is WizardPreset => preset !== null);
  } catch {
    return [];
  }
};

export const saveWizardPresets = (presets: WizardPreset[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    WIZARD_PRESETS_STORAGE_KEY,
    JSON.stringify(presets)
  );
};
