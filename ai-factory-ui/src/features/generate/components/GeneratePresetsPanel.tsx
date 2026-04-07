'use client';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useGeneratePageContext } from '@/features/generate/context/GeneratePageContext';

export function GeneratePresetsPanel() {
  const { presetsModel } = useGeneratePageContext();
  const {
    presets,
    selectedPresetId,
    presetName,
    canLoadPreset,
    onPresetSelect,
    onPresetNameChange,
    onCreateNewPreset,
    onSavePreset,
    onLoadPreset,
    onDeletePreset,
  } = presetsModel;

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">Presets</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px_auto]">
        <Select
          value={selectedPresetId || undefined}
          onValueChange={onPresetSelect}
        >
          <SelectTrigger className="border-slate-700 bg-slate-950/50 text-slate-200">
            <SelectValue placeholder="Select saved preset" />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={presetName}
          onChange={(event) => onPresetNameChange(event.target.value)}
          placeholder="Preset name"
          className="border-slate-700 bg-slate-950/50 text-slate-200"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={onCreateNewPreset}
            className="border-slate-700 bg-slate-800/50 text-slate-200"
          >
            New
          </Button>
          <Button onClick={onSavePreset} className="bg-sky-600 hover:bg-sky-700 text-white">
            Save
          </Button>
          <Button
            variant="outline"
            onClick={onLoadPreset}
            disabled={!canLoadPreset}
            className="border-slate-700 bg-slate-800/50 text-slate-200"
          >
            Load
          </Button>
          <Button
            variant="outline"
            onClick={onDeletePreset}
            disabled={!canLoadPreset}
            className="border-rose-500/50 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
          >
            Delete
          </Button>
        </div>
      </div>
    </section>
  );
}
