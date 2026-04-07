import { QuickAddStyleLoraItem } from '@/features/library/components/QuickAdd/QuickAddStyleLoraItem';
import { StyleQuickAddDraft } from '@/features/library/components/QuickAdd/types';

type QuickAddStyleLoraListProps = {
  value: StyleQuickAddDraft;
  onChange: (next: StyleQuickAddDraft) => void;
};

export function QuickAddStyleLoraList({ value, onChange }: QuickAddStyleLoraListProps) {
  const updateLora = (index: number, patch: Partial<(typeof value.loras)[number]>) => {
    const next = [...value.loras];
    next[index] = { ...next[index], ...patch };
    onChange({ ...value, loras: next });
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">LoRAs</p>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...value,
              loras: [...value.loras, { file: '', strength: 0.8, positive: '', negative: '' }],
            })
          }
          className="rounded border border-teal-500/70 bg-teal-500/20 px-2 py-1 text-[11px] font-semibold text-teal-100"
        >
          + LoRA
        </button>
      </div>

      <div className="mt-2 space-y-2">
        {value.loras.map((lora, index) => (
          <QuickAddStyleLoraItem
            key={`${lora.file}-${index}`}
            lora={lora}
            index={index}
            total={value.loras.length}
            onChange={updateLora}
            onRemove={(current) =>
              onChange({ ...value, loras: value.loras.filter((_, idx) => idx !== current) })
            }
          />
        ))}
      </div>
    </div>
  );
}
