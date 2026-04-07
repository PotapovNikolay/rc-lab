import { QuickAddType } from '@/features/wizard/types';
export type { QuickAddType };

export type StyleLoraDraft = {
  file: string;
  strength: number;
  positive: string;
  negative: string;
};

export type StyleQuickAddDraft = {
  name: string;
  positive: string;
  negative: string;
  bodyPositive: string;
  bodyNegative: string;
  loras: StyleLoraDraft[];
};

export type CharacterQuickAddDraft = {
  name: string;
  source: string;
  weight: number;
  loraFile: string;
  loraStrength: number;
  appearancePositive: string;
  appearanceNegative: string;
  defaultOutfitPositive: string;
  defaultOutfitNegative: string;
  positive: string;
  negative: string;
};

export const QUICK_ADD_LABELS: Record<QuickAddType, string> = {
  styles: 'Style',
  characters: 'Character',
  cameras: 'Camera',
  outfits: 'Outfit',
  poses: 'Pose',
  expressions: 'Expression',
  backgrounds: 'Background',
};
