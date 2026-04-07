import { StyleQuickAddDraft } from '@/features/library/components/QuickAdd/types';

type QuickAddStyleBodyFieldsProps = {
  value: StyleQuickAddDraft;
  onChange: (next: StyleQuickAddDraft) => void;
};

export function QuickAddStyleBodyFields({ value, onChange }: QuickAddStyleBodyFieldsProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Body</p>
      <div className="mt-2 grid gap-2">
        <textarea
          rows={2}
          placeholder="Body positive"
          value={value.bodyPositive}
          onChange={(event) => onChange({ ...value, bodyPositive: event.target.value })}
          className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
        <textarea
          rows={2}
          placeholder="Body negative"
          value={value.bodyNegative}
          onChange={(event) => onChange({ ...value, bodyNegative: event.target.value })}
          className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
