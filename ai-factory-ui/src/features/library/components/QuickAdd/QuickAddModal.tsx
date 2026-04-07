import { QuickAddCharacterForm } from '@/features/library/components/QuickAdd/QuickAddCharacterForm';
import { QuickAddStyleForm } from '@/features/library/components/QuickAdd/QuickAddStyleForm';
import { SimpleQuickAddFields } from '@/features/library/components/QuickAdd/SimpleQuickAddFields';
import { QuickAddModalModel } from '@/features/library/components/QuickAdd/quickAddModel';
import { QUICK_ADD_LABELS } from '@/features/library/components/QuickAdd/types';

type QuickAddModalProps = {
  model: QuickAddModalModel;
};

export function QuickAddModal({ model }: QuickAddModalProps) {
  if (!model.quickAddType) return null;

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
          Quick Add {QUICK_ADD_LABELS[model.quickAddType]}
        </p>

        <div className="mt-4 grid gap-3">
          <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
            ID
            <input
              value={model.quickAddId}
              onChange={(event) => model.onQuickAddIdChange(event.target.value)}
              placeholder="example_component"
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
            />
          </label>

          {model.quickAddType === 'styles' && (
            <QuickAddStyleForm value={model.quickAddStyle} onChange={model.onQuickAddStyleChange} />
          )}
          {model.quickAddType === 'characters' && (
            <QuickAddCharacterForm value={model.quickAddCharacter} onChange={model.onQuickAddCharacterChange} />
          )}
          {model.quickAddType !== 'styles' && model.quickAddType !== 'characters' && (
            <SimpleQuickAddFields
              name={model.quickAddName}
              positive={model.quickAddPositive}
              negative={model.quickAddNegative}
              onNameChange={model.onQuickAddNameChange}
              onPositiveChange={model.onQuickAddPositiveChange}
              onNegativeChange={model.onQuickAddNegativeChange}
            />
          )}

          {model.quickAddError && (
            <p className="rounded-md border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {model.quickAddError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={model.onSave}
              disabled={model.quickAddPending}
              className="rounded-lg border border-teal-500/70 bg-teal-500/20 px-4 py-2 text-sm font-semibold text-teal-100 disabled:opacity-60"
            >
              {model.quickAddPending ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={model.onCancel}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
