import { ComponentType } from '@/core/types';

type LibraryItemListModel = {
  search: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  filteredEntries: Array<[string, unknown]>;
  activeType: ComponentType;
  describeItem: (type: ComponentType, item: unknown) => string;
  onEdit: (id: string, item: unknown) => void;
  onDelete: (id: string) => void;
};

type LibraryItemListProps = {
  model: LibraryItemListModel;
};

export function LibraryItemList({ model }: LibraryItemListProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={model.search}
          onChange={(event) => model.onSearchChange(event.target.value)}
          placeholder="Search by id or name"
          className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm sm:max-w-sm"
        />
        <button
          type="button"
          onClick={model.onAddNew}
          className="rounded-lg border border-teal-500/70 bg-teal-500/20 px-3 py-2 text-sm font-semibold text-teal-100"
        >
          + Add New
        </button>
      </div>

      <div className="space-y-2">
        {model.filteredEntries.map(([id, item]) => (
          <div key={id} className="rounded-lg border border-slate-700 bg-slate-950/70 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  {item && typeof item === 'object' && 'name' in item
                    ? String((item as { name?: string }).name ?? id)
                    : id}
                </p>
                <p className="mt-1 text-xs text-slate-400">{id}</p>
                <p className="mt-1 text-xs text-slate-500">{model.describeItem(model.activeType, item)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => model.onEdit(id, item)}
                  className="rounded border border-sky-600/70 px-2 py-1 text-xs text-sky-300"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => model.onDelete(id)}
                  className="rounded border border-rose-600/70 px-2 py-1 text-xs text-rose-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {model.filteredEntries.length === 0 && (
        <p className="text-sm text-slate-400">No items found for this tab.</p>
      )}
    </div>
  );
}
