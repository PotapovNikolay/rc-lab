import { OutputImage } from '@/core/types';
import { LazyThumbnail } from '@/features/gallery/components/LazyThumbnail';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Skeleton } from '@/shared/ui/skeleton';

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
    <div className="flex-1 flex flex-col rounded-2xl border border-slate-700 bg-slate-900/40 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Images</p>
        {activeGroup && (
          <span className="text-xs text-slate-400 font-medium">
            {activeGroup.style} / {activeGroup.character}
          </span>
        )}
      </div>

      <ScrollArea className="flex-1">
        {!activeGroup && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-slate-500">Select a group to view images</p>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl bg-slate-800/50" />
            ))}
          </div>
        )}

        {activeGroup && !isLoading && images.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-slate-500">No images in this group</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={image.filename}
              type="button"
              onClick={() => onOpenImage(index)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 transition-all hover:border-teal-500/50 hover:scale-[1.02]"
            >
              {activeGroup && (
                <LazyThumbnail
                  url={getThumbnailUrl(image.filename)}
                  alt={image.filename}
                  className="h-full w-full object-cover transition-opacity duration-300"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-[10px] text-slate-200">
                  {image.filename}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
