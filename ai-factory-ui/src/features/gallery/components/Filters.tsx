import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

type GalleryFiltersModel = {
  selectedStyle: string;
  selectedCharacter: string;
  styleOptions: string[];
  characterOptions: string[];
  imageCount: number;
  totalCount: number;
  onStyleChange: (value: string) => void;
  onCharacterChange: (value: string) => void;
};

type GalleryFiltersProps = {
  model: GalleryFiltersModel;
};

export function GalleryFilters({ model }: GalleryFiltersProps) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Filters</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 ml-1">Style</label>
          <Select
            value={model.selectedStyle}
            onValueChange={model.onStyleChange}
          >
            <SelectTrigger className="bg-slate-950/60 border-slate-700">
              <SelectValue placeholder="All styles" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
              <SelectItem value="all">All styles</SelectItem>
              {model.styleOptions.map((style) => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 ml-1">Character</label>
          <Select
            value={model.selectedCharacter}
            onValueChange={model.onCharacterChange}
          >
            <SelectTrigger className="bg-slate-950/60 border-slate-700">
              <SelectValue placeholder="All characters" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
              <SelectItem value="all">All characters</SelectItem>
              {model.characterOptions.map((character) => (
                <SelectItem key={character} value={character}>
                  {character}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <div className="w-full rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-2.5 text-xs text-slate-400 flex items-center justify-between">
            <span>Statistics</span>
            <span className="font-bold text-slate-200">
              {model.imageCount} / {model.totalCount}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
