type SelectedGroup = {
  style: string;
  character: string;
};

type Group = {
  style: string;
  character: string;
  count: number;
  latest: string;
};

type GalleryGroupsPanelProps = {
  groups: Group[];
  activeGroup: SelectedGroup | null;
  isLoading: boolean;
  onSelectGroup: (group: SelectedGroup) => void;
};

export function GalleryGroupsPanel({
  groups,
  activeGroup,
  isLoading,
  onSelectGroup,
}: GalleryGroupsPanelProps) {
  return (
    <aside className="space-y-2 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Groups</p>

      {groups.map((group) => {
        const selected =
          activeGroup?.style === group.style && activeGroup?.character === group.character;

        return (
          <button
            key={`${group.style}-${group.character}`}
            type="button"
            onClick={() => onSelectGroup({ style: group.style, character: group.character })}
            className={`w-full rounded-lg border px-3 py-2 text-left ${
              selected
                ? 'border-teal-500/70 bg-teal-500/20 text-teal-100'
                : 'border-slate-700 bg-slate-950/70 text-slate-200'
            }`}
          >
            <p className="text-sm font-semibold">
              {group.style} / {group.character}
            </p>
            <p className="mt-1 text-xs text-slate-400">{group.count} images</p>
          </button>
        );
      })}

      {!isLoading && groups.length === 0 && (
        <p className="text-sm text-slate-400">No groups for current filters.</p>
      )}
    </aside>
  );
}
