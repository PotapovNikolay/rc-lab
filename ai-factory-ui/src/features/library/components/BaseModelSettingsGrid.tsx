import { Dispatch, SetStateAction } from 'react';
import { BaseModel } from '@/core/types';

type BaseModelSettingsGridProps = {
  setBaseModelDraft: Dispatch<SetStateAction<BaseModel>>;
  settings: BaseModel['settings'];
  checkpoint: string;
};

export function BaseModelSettingsGrid({
  setBaseModelDraft,
  settings,
  checkpoint,
}: BaseModelSettingsGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Checkpoint" value={checkpoint} onChange={(value) => setBaseModelDraft((prev) => ({ ...prev, checkpoint: value }))} />
      <Field label="Sampler" value={settings.sampler} onChange={(value) => setBaseModelDraft((prev) => ({ ...prev, settings: { ...prev.settings, sampler: value } }))} />
      <Field label="Scheduler" value={settings.scheduler} onChange={(value) => setBaseModelDraft((prev) => ({ ...prev, settings: { ...prev.settings, scheduler: value } }))} />
      <FieldNumber label="Width" value={settings.width} onChange={(value) => setBaseModelDraft((prev) => ({ ...prev, settings: { ...prev.settings, width: value } }))} />
      <FieldNumber label="Height" value={settings.height} onChange={(value) => setBaseModelDraft((prev) => ({ ...prev, settings: { ...prev.settings, height: value } }))} />
      <FieldNumber label="Steps" value={settings.steps} onChange={(value) => setBaseModelDraft((prev) => ({ ...prev, settings: { ...prev.settings, steps: value } }))} />
      <FieldNumber label="CFG" value={settings.cfg} step={0.5} onChange={(value) => setBaseModelDraft((prev) => ({ ...prev, settings: { ...prev.settings, cfg: value } }))} />
      <FieldNumber label="Clip Skip" value={settings.clip_skip} onChange={(value) => setBaseModelDraft((prev) => ({ ...prev, settings: { ...prev.settings, clip_skip: value } }))} />
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm" />
    </label>
  );
}

function FieldNumber({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (value: number) => void; step?: number }) {
  return (
    <label className="block">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <input type="number" value={value} step={step} onChange={(event) => onChange(Number(event.target.value))} className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm" />
    </label>
  );
}
