import { CharacterQuickAddDraft, QuickAddType, StyleQuickAddDraft } from '@/features/library/components/QuickAdd/types';

export type QuickAddModalModel = {
  quickAddType: QuickAddType | null;
  quickAddId: string;
  quickAddName: string;
  quickAddPositive: string;
  quickAddNegative: string;
  quickAddStyle: StyleQuickAddDraft;
  quickAddCharacter: CharacterQuickAddDraft;
  quickAddError: string;
  quickAddPending: boolean;
  onQuickAddIdChange: (value: string) => void;
  onQuickAddNameChange: (value: string) => void;
  onQuickAddPositiveChange: (value: string) => void;
  onQuickAddNegativeChange: (value: string) => void;
  onQuickAddStyleChange: (value: StyleQuickAddDraft) => void;
  onQuickAddCharacterChange: (value: CharacterQuickAddDraft) => void;
  onSave: () => void;
  onCancel: () => void;
};
