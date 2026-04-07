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
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Filters</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-sm text-slate-300">
          Style
          <select
            value={model.selectedStyle}
            onChange={(event) => model.onStyleChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
          >
            <option value="all">All styles</option>
            {model.styleOptions.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-300">
          Character
          <select
            value={model.selectedCharacter}
            onChange={(event) => model.onCharacterChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
          >
            <option value="all">All characters</option>
            {model.characterOptions.map((character) => (
              <option key={character} value={character}>
                {character}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
          Showing {model.imageCount} of {model.totalCount} images
        </div>
      </div>
    </section>
  );
}
