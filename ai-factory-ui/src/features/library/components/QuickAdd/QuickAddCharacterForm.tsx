import { QuickAddCharacterDetailsFields } from '@/features/library/components/QuickAdd/QuickAddCharacterDetailsFields';
import { QuickAddCharacterIdentityFields } from '@/features/library/components/QuickAdd/QuickAddCharacterIdentityFields';
import { QuickAddCharacterOutfitFields } from '@/features/library/components/QuickAdd/QuickAddCharacterOutfitFields';
import { CharacterQuickAddDraft } from '@/features/library/components/QuickAdd/types';

type QuickAddCharacterFormProps = {
  value: CharacterQuickAddDraft;
  onChange: (next: CharacterQuickAddDraft) => void;
};

export function QuickAddCharacterForm({ value, onChange }: QuickAddCharacterFormProps) {
  return (
    <>
      <QuickAddCharacterIdentityFields value={value} onChange={onChange} />
      <QuickAddCharacterDetailsFields value={value} onChange={onChange} />
      <QuickAddCharacterOutfitFields value={value} onChange={onChange} />
    </>
  );
}
