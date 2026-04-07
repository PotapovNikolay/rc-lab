import { CharacterQuickAddDraft } from '@/features/library/components/QuickAdd/types';

type QuickAddCharacterDetailsFieldsProps = {
  value: CharacterQuickAddDraft;
  onChange: (next: CharacterQuickAddDraft) => void;
};

export function QuickAddCharacterDetailsFields({
  value,
  onChange,
}: QuickAddCharacterDetailsFieldsProps) {
  return (
    <>
      <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">LoRA</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input
            placeholder="character.safetensors"
            value={value.loraFile}
            onChange={(event) => onChange({ ...value, loraFile: event.target.value })}
            className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            max={2}
            step={0.05}
            value={value.loraStrength}
            onChange={(event) => onChange({ ...value, loraStrength: Number(event.target.value) })}
            className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <textarea
          rows={2}
          placeholder="Appearance positive"
          value={value.appearancePositive}
          onChange={(event) => onChange({ ...value, appearancePositive: event.target.value })}
          className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
        <textarea
          rows={2}
          placeholder="Appearance negative"
          value={value.appearanceNegative}
          onChange={(event) => onChange({ ...value, appearanceNegative: event.target.value })}
          className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
      </div>
    </>
  );
}
