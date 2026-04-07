import { QuickAddStyleBaseFields } from '@/features/library/components/QuickAdd/QuickAddStyleBaseFields';
import { QuickAddStyleBodyFields } from '@/features/library/components/QuickAdd/QuickAddStyleBodyFields';
import { QuickAddStyleLoraList } from '@/features/library/components/QuickAdd/QuickAddStyleLoraList';
import { StyleQuickAddDraft } from '@/features/library/components/QuickAdd/types';

type QuickAddStyleFormProps = {
  value: StyleQuickAddDraft;
  onChange: (next: StyleQuickAddDraft) => void;
};

export function QuickAddStyleForm({ value, onChange }: QuickAddStyleFormProps) {
  return (
    <>
      <QuickAddStyleBaseFields value={value} onChange={onChange} />
      <QuickAddStyleBodyFields value={value} onChange={onChange} />
      <QuickAddStyleLoraList value={value} onChange={onChange} />
    </>
  );
}
