import { StyleLoraDraft } from '@/features/library/components/QuickAdd/types';

type QuickAddStyleLoraItemProps = {
  lora: StyleLoraDraft;
  index: number;
  total: number;
  onChange: (index: number, patch: Partial<StyleLoraDraft>) => void;
  onRemove: (index: number) => void;
};

export function QuickAddStyleLoraItem({
  lora,
  index,
  total,
  onChange,
  onRemove,
}: QuickAddStyleLoraItemProps) {
  return (
    <div className="rounded-md border border-slate-700 bg-slate-900/80 p-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          placeholder="file.safetensors"
          value={lora.file}
          onChange={(event) => onChange(index, { file: event.target.value })}
          className="rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-xs"
        />
        <input
          type="number"
          min={0}
          max={2}
          step={0.05}
          value={lora.strength}
          onChange={(event) => onChange(index, { strength: Number(event.target.value) })}
          className="rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-xs"
        />
      </div>

      <div className="mt-2 grid gap-2">
        <textarea
          rows={2}
          placeholder="LoRA positive"
          value={lora.positive}
          onChange={(event) => onChange(index, { positive: event.target.value })}
          className="rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-xs"
        />
        <textarea
          rows={2}
          placeholder="LoRA negative"
          value={lora.negative}
          onChange={(event) => onChange(index, { negative: event.target.value })}
          className="rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-xs"
        />
      </div>

      {total > 1 && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="mt-2 rounded border border-rose-600/70 px-2 py-1 text-[11px] text-rose-300"
        >
          Remove LoRA
        </button>
      )}
    </div>
  );
}
