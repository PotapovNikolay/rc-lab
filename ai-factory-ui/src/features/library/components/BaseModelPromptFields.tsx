import { Dispatch, SetStateAction } from 'react';
import { BaseModel } from '@/core/types';

type BaseModelPromptFieldsProps = {
  setBaseModelDraft: Dispatch<SetStateAction<BaseModel>>;
  positive: string;
  negative: string;
};

export function BaseModelPromptFields({
  setBaseModelDraft,
  positive,
  negative,
}: BaseModelPromptFieldsProps) {
  return (
    <>
      <label className="block">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Positive</p>
        <textarea
          rows={5}
          value={positive}
          onChange={(event) => setBaseModelDraft((prev) => ({ ...prev, positive: event.target.value }))}
          className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Negative</p>
        <textarea
          rows={5}
          value={negative}
          onChange={(event) => setBaseModelDraft((prev) => ({ ...prev, negative: event.target.value }))}
          className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
        />
      </label>
    </>
  );
}
