import { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

type SelectionGridModel<T extends { name: string }> = {
  entries: Array<[string, T]>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  emptyText: string;
  multiSelect?: boolean;
  renderMeta?: (item: T) => string;
  actions?: ReactNode;
};

type SelectionGridProps<T extends { name: string }> = {
  model: SelectionGridModel<T>;
};

export function SelectionGrid<T extends { name: string }>({
  model,
}: SelectionGridProps<T>) {
  if (model.entries.length === 0) {
    return <p className="text-sm text-slate-400">{model.emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {model.actions && <div>{model.actions}</div>}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {model.entries.map(([id, item]) => {
          const selected = model.selectedIds.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => model.onToggle(id)}
              className={cn(
                'rounded-lg border p-3 text-left transition-colors',
                selected
                  ? 'border-teal-500/80 bg-teal-500/15'
                  : 'border-slate-700 bg-slate-900/80 hover:border-slate-500'
              )}
            >
              <p className="text-sm font-semibold text-slate-100">{item.name}</p>
              <p className="mt-1 text-xs text-slate-400">{id}</p>
              {model.renderMeta && (
                <p className="mt-2 text-xs text-slate-300">
                  {model.renderMeta(item)}
                </p>
              )}
              <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-slate-500">
                {model.multiSelect
                  ? selected
                    ? 'Selected'
                    : 'Click to select'
                  : selected
                    ? 'Chosen'
                    : 'Click to choose'}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
