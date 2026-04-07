import { LazyThumbnail } from '@/features/gallery/components/LazyThumbnail';
import { OutputImage } from '@/core/types';

type SelectedGroup = {
  style: string;
  character: string;
};

type GalleryImagesPanelProps = {
  activeGroup: SelectedGroup | null;
  isLoading: boolean;
  images: OutputImage[];
  getThumbnailUrl: (filename: string) => string;
  onOpenImage: (index: number) => void;
};

export function GalleryImagesPanel({
  activeGroup,
  isLoading,
  images,
  getThumbnailUrl,
  onOpenImage,
}: GalleryImagesPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Images</p>

      {!activeGroup && <p className="mt-3 text-sm text-slate-400">Select a group to view images.</p>}

      {isLoading && <p className="mt-3 text-sm text-slate-400">Loading images...</p>}

      {activeGroup && !isLoading && images.length === 0 && (
        <p className="mt-3 text-sm text-slate-400">No images in this group.</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {images.map((image, index) => (
          <button
            key={image.filename}
            type="button"
            onClick={() => onOpenImage(index)}
            className="group overflow-hidden rounded-xl border border-slate-700 bg-slate-950/70 text-left"
          >
            {activeGroup && (
              <LazyThumbnail
                url={getThumbnailUrl(image.filename)}
                alt={image.filename}
                className="h-40 w-full object-cover"
              />
            )}
            <div className="px-2 py-2">
              <p className="truncate text-xs text-slate-300 group-hover:text-white">
                {image.filename}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
