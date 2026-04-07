import { ProtectedApiImage } from '@/features/gallery/components/ProtectedApiImage';
import { GalleryLightboxModel } from '@/features/gallery/components/lightboxModel';

type GalleryLightboxViewerProps = {
  model: GalleryLightboxModel;
};

export function GalleryLightboxViewer({ model }: GalleryLightboxViewerProps) {
  if (!model.activeImage) return null;

  return (
    <div className="relative rounded-2xl border border-slate-700 bg-slate-900/70 p-3">
      <ProtectedApiImage
        url={model.getImageUrl(model.activeImage.filename)}
        alt={model.activeImage.filename}
        className="h-full max-h-[82vh] w-full rounded-lg object-contain"
      />

      <div className="absolute left-3 top-3 flex gap-2">
        <button
          type="button"
          onClick={model.onPrev}
          className="rounded border border-slate-600 bg-slate-900/80 px-2 py-1 text-xs text-slate-200"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={model.onNext}
          disabled={model.imagesLength < 2}
          className="rounded border border-slate-600 bg-slate-900/80 px-2 py-1 text-xs text-slate-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
