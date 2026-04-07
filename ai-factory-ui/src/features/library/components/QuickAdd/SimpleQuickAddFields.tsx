type SimpleQuickAddFieldsProps = {
  name: string;
  positive: string;
  negative: string;
  onNameChange: (value: string) => void;
  onPositiveChange: (value: string) => void;
  onNegativeChange: (value: string) => void;
};

export function SimpleQuickAddFields({
  name,
  positive,
  negative,
  onNameChange,
  onPositiveChange,
  onNegativeChange,
}: SimpleQuickAddFieldsProps) {
  return (
    <>
      <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
        Name
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Display name"
          className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
        Positive
        <textarea
          rows={3}
          value={positive}
          onChange={(event) => onPositiveChange(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
      </label>

      <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
        Negative
        <textarea
          rows={3}
          value={negative}
          onChange={(event) => onNegativeChange(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
      </label>
    </>
  );
}
