import { GalleryLightboxDetails } from '@/features/gallery/components/GalleryLightboxDetails';
import { GalleryLightboxViewer } from '@/features/gallery/components/GalleryLightboxViewer';
import { GalleryLightboxModel } from '@/features/gallery/components/lightboxModel';

type GalleryLightboxProps = {
  model: GalleryLightboxModel;
};

export function GalleryLightbox({ model }: GalleryLightboxProps) {
  if (!model.activeGroup || !model.activeImage) return null;

  return (
    <section className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/95 p-4">
      <button
        type="button"
        onClick={model.onClose}
        className="absolute right-4 top-4 z-50 rounded-md border border-slate-500/70 bg-slate-900/85 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-800"
      >
        Close
      </button>
      <div className="grid h-full max-h-[92vh] w-full max-w-6xl gap-4 lg:grid-cols-[2fr_1fr]">
        <GalleryLightboxViewer model={model} />
        <GalleryLightboxDetails model={model} />
      </div>
    </section>
  );
}
