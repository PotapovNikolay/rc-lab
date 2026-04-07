import { StyleQuickAddDraft } from '@/features/library/components/QuickAdd/types';

type QuickAddStyleBaseFieldsProps = {
  value: StyleQuickAddDraft;
  onChange: (next: StyleQuickAddDraft) => void;
};

export function QuickAddStyleBaseFields({ value, onChange }: QuickAddStyleBaseFieldsProps) {
  return (
    <>
      <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
        Name
        <input
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
        Positive
        <textarea
          rows={2}
          value={value.positive}
          onChange={(event) => onChange({ ...value, positive: event.target.value })}
          className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
      </label>

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
