import { cn } from '@/shared/lib/utils';

type TabOption = {
  id: string;
  title: string;
};

type LibraryTabsProps = {
  tabs: TabOption[];
  activeTab: string;
  onSelect: (id: string) => void;
};

export function LibraryTabs({ tabs, activeTab, onSelect }: LibraryTabsProps) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={cn(
              'rounded-lg border px-3 py-2 text-sm',
              activeTab === tab.id
                ? 'border-teal-500/80 bg-teal-500/20 text-teal-100'
                : 'border-slate-700 bg-slate-800/70 text-slate-300'
            )}
          >
            {tab.title}
          </button>
        ))}
      </div>
    </section>
  );
}
