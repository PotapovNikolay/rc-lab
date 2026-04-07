import { CharacterQuickAddDraft } from '@/features/library/components/QuickAdd/types';

type QuickAddCharacterOutfitFieldsProps = {
  value: CharacterQuickAddDraft;
  onChange: (next: CharacterQuickAddDraft) => void;
};

export function QuickAddCharacterOutfitFields({
  value,
  onChange,
}: QuickAddCharacterOutfitFieldsProps) {
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        <textarea
          rows={2}
          placeholder="Default outfit positive"
          value={value.defaultOutfitPositive}
          onChange={(event) => onChange({ ...value, defaultOutfitPositive: event.target.value })}
          className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
        <textarea
          rows={2}
          placeholder="Default outfit negative"
          value={value.defaultOutfitNegative}
          onChange={(event) => onChange({ ...value, defaultOutfitNegative: event.target.value })}
          className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
      </div>

      <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
        Negative
        <textarea
          rows={2}
          value={value.negative}
          onChange={(event) => onChange({ ...value, negative: event.target.value })}
          className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
      </label>
    </>
  );
}
