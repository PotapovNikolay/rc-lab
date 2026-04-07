import { CharacterQuickAddDraft } from '@/features/library/components/QuickAdd/types';

type QuickAddCharacterIdentityFieldsProps = {
  value: CharacterQuickAddDraft;
  onChange: (next: CharacterQuickAddDraft) => void;
};

export function QuickAddCharacterIdentityFields({
  value,
  onChange,
}: QuickAddCharacterIdentityFieldsProps) {
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
          Name
          <input
            value={value.name}
            onChange={(event) => onChange({ ...value, name: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
          Source
          <input
            value={value.source}
            onChange={(event) => onChange({ ...value, source: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
          Weight
          <input
            type="number"
            min={0}
            max={2}
            step={0.05}
            value={value.weight}
            onChange={(event) => onChange({ ...value, weight: Number(event.target.value) })}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
          Trigger Positive
          <input
            value={value.positive}
            onChange={(event) => onChange({ ...value, positive: event.target.value })}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
          />
        </label>
      </div>
    </>
  );
}
