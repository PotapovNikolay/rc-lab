import { Dispatch, SetStateAction } from 'react';
import { BaseModel } from '@/core/types';
import { BaseModelPromptFields } from './BaseModelPromptFields';
import { BaseModelSettingsGrid } from './BaseModelSettingsGrid';

type BaseModelFormProps = {
  baseModelDraft: BaseModel;
  setBaseModelDraft: Dispatch<SetStateAction<BaseModel>>;
  onSave: () => void;
  isSaving: boolean;
};

export function BaseModelForm({
  baseModelDraft,
  setBaseModelDraft,
  onSave,
  isSaving,
}: BaseModelFormProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
      <BaseModelSettingsGrid
        setBaseModelDraft={setBaseModelDraft}
        settings={baseModelDraft.settings}
        checkpoint={baseModelDraft.checkpoint}
      />
      <BaseModelPromptFields
        setBaseModelDraft={setBaseModelDraft}
        positive={baseModelDraft.positive}
        negative={baseModelDraft.negative}
      />
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="rounded-lg border border-teal-500/70 bg-teal-500/20 px-4 py-2 text-sm font-semibold text-teal-100 disabled:opacity-60"
      >
        {isSaving ? 'Saving...' : 'Save Base Model'}
      </button>
    </section>
  );
}
