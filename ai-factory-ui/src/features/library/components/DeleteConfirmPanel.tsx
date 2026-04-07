import { ComponentType } from '@/core/types';

type DeleteConfirmPanelProps = {
  deleteTargetId: string;
  activeType: ComponentType;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmPanel({
  deleteTargetId,
  activeType,
  onConfirm,
  onCancel,
}: DeleteConfirmPanelProps) {
  return (
    <section className="rounded-2xl border border-rose-500/60 bg-rose-500/10 p-5">
      <p className="text-sm text-rose-100">
        Delete `{deleteTargetId}` from `{activeType}`?
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg border border-rose-500/70 bg-rose-500/20 px-3 py-2 text-sm font-semibold text-rose-100"
        >
          Confirm Delete
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200"
        >
          Cancel
        </button>
      </div>
    </section>
  );
}
