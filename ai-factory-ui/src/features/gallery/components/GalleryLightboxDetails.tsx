import { GalleryLightboxModel } from '@/features/gallery/components/lightboxModel';

type GalleryLightboxDetailsProps = {
  model: GalleryLightboxModel;
};

export function GalleryLightboxDetails({ model }: GalleryLightboxDetailsProps) {
  if (!model.activeGroup || !model.activeImage) return null;

  return (
    <div className="space-y-3 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
      <p className="text-sm font-semibold text-slate-100">{model.activeImage.filename}</p>
      <p className="text-xs text-slate-400">{model.activeGroup.style} / {model.activeGroup.character}</p>
      <LightboxActions model={model} />
      {model.actionError && <p className="rounded-md border border-rose-500/50 bg-rose-500/10 px-2 py-1 text-xs text-rose-200">{model.actionError}</p>}
      <LightboxMetadata model={model} />
    </div>
  );
}

function LightboxActions({ model }: GalleryLightboxDetailsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={model.onCopySeed} disabled={!model.activeImage?.metadata} className="rounded border border-teal-500/70 bg-teal-500/20 px-2 py-1 text-xs font-semibold text-teal-100 disabled:opacity-50">Copy Seed</button>
      <button type="button" onClick={model.onRepeatInWizard} disabled={!model.activeImage?.metadata} className="rounded border border-amber-500/70 bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-100 disabled:opacity-50">Repeat In Wizard</button>
      <button type="button" onClick={model.onDownload} className="rounded border border-sky-500/70 bg-sky-500/20 px-2 py-1 text-xs font-semibold text-sky-100">Download</button>
      <button type="button" onClick={model.onDelete} className="rounded border border-rose-500/70 bg-rose-500/20 px-2 py-1 text-xs font-semibold text-rose-100">Delete</button>
      <button type="button" onClick={model.onClose} className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200">Close</button>
    </div>
  );
}

function LightboxMetadata({ model }: GalleryLightboxDetailsProps) {
  const metadata = model.activeImage?.metadata;
  if (!metadata) return <p className="text-xs text-slate-400">Metadata not found for this image.</p>;
  return (
    <div className="space-y-2 text-xs text-slate-300">
      <Detail label="Seed" value={String(metadata.seed)} />
      <Detail label="Generated" value={new Date(metadata.generated).toLocaleString()} />
      <Detail label="Style" value={metadata.components.style} />
      <Detail label="Character" value={metadata.components.character} />
      <Detail label="Outfit" value={metadata.components.outfit} />
      <Detail label="Camera" value={metadata.components.camera} />
      <Detail label="Pose" value={metadata.components.pose} />
      <Detail label="Expression" value={metadata.components.expression} />
      <Detail label="Background" value={metadata.components.background} />
      <Detail label="LoRAs" value={metadata.loras.map((lora) => `${lora.file} (${lora.strength})`).join(', ')} />
      <Detail label="Prompt +" value={metadata.prompt.positive} />
      <Detail label="Prompt -" value={metadata.prompt.negative} />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1">
      <p className="text-[11px] uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-xs text-slate-200">{value}</p>
    </div>
  );
}
