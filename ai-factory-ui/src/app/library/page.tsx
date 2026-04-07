'use client';

import { useEffect, useState } from 'react';
import { BaseModelForm } from '@/features/library/components/BaseModelForm';
import { DeleteConfirmPanel } from '@/features/library/components/DeleteConfirmPanel';
import { LibraryItemList } from '@/features/library/components/LibraryItemList';
import { LibraryTabs } from '@/features/library/components/LibraryTabs';
import {
  useBaseModel,
  useCreateItem,
  useDeleteItem,
  useLibrary,
  useUpdateBaseModel,
  useUpdateItem,
} from '@/shared/hooks';
import { BaseModel, Character, ComponentType, SimpleComponent, Style } from '@/core/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { toast } from 'sonner';

type TabType = ComponentType | 'base_model';
type EditorMode = 'create' | 'edit';

type EditorState = {
  mode: EditorMode;
  id: string;
  jsonText: string;
};

type EditorFormProps = {
  editor: EditorState;
  editorError: string;
  onIdChange: (value: string) => void;
  onJsonChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  textareaMinHeightClass: string;
};

function EditorForm({
  editor,
  editorError,
  onIdChange,
  onJsonChange,
  onSave,
  onCancel,
  textareaMinHeightClass,
}: EditorFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">ID</label>
        <Input
          value={editor.id}
          onChange={(event) => onIdChange(event.target.value)}
          disabled={editor.mode === 'edit'}
          className="bg-slate-950/60 border-slate-700 h-9"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400">JSON Payload</label>
        <Textarea
          value={editor.jsonText}
          onChange={(event) => onJsonChange(event.target.value)}
          className={`bg-slate-950/60 border-slate-700 font-mono text-[11px] ${textareaMinHeightClass}`}
        />
      </div>

      {editorError && (
        <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20">
          {editorError}
        </p>
      )}

      <div className="flex gap-2">
        <Button onClick={onSave} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1 border-slate-700">
          Cancel
        </Button>
      </div>
    </div>
  );
}

const tabs: Array<{ id: TabType; title: string }> = [
  { id: 'styles', title: 'Styles' },
  { id: 'characters', title: 'Characters' },
  { id: 'outfits', title: 'Outfits' },
  { id: 'cameras', title: 'Cameras' },
  { id: 'poses', title: 'Poses' },
  { id: 'expressions', title: 'Expressions' },
  { id: 'backgrounds', title: 'Backgrounds' },
  { id: 'base_model', title: 'Base Model' },
];

const EMPTY_BASE_MODEL: BaseModel = {
  checkpoint: '',
  settings: {
    width: 1024,
    height: 1024,
    steps: 28,
    cfg: 5,
    sampler: 'euler',
    scheduler: 'normal',
    clip_skip: 2,
  },
  positive: '',
  negative: '',
};

const getCreateTemplate = (type: ComponentType): string => {
  if (type === 'styles') {
    return JSON.stringify({
      name: 'New Style',
      loras: [{ file: 'style.safetensors', strength: 0.8, positive: '', negative: '' }],
      body: { positive: '', negative: '' },
      positive: '',
      negative: '',
    }, null, 2);
  }

  if (type === 'characters') {
    return JSON.stringify({
      name: 'New Character',
      source: '',
      weight: 1,
      lora: { file: 'character.safetensors', strength: 0.8 },
      appearance: { positive: '', negative: '' },
      default_outfit: { positive: '', negative: '' },
      positive: '',
      negative: '',
    }, null, 2);
  }

  return JSON.stringify({
    name: 'New Component',
    positive: '',
    negative: '',
  }, null, 2);
};

const describeItem = (type: ComponentType, item: unknown): string => {
  if (!item || typeof item !== 'object') return '';
  if (type === 'styles') {
    const style = item as Style;
    return `${style.loras?.length ?? 0} loras`;
  }
  if (type === 'characters') {
    const character = item as Character;
    return character.source || 'character';
  }
  const simple = item as SimpleComponent;
  return simple.positive || '';
};

function useLibraryPageView() {
  const [activeTab, setActiveTab] = useState<TabType>('styles');
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [editorError, setEditorError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const queryOptions = { staleTime: 5 * 60 * 1000 };
  const stylesQuery = useLibrary<Style>('styles', {
    ...queryOptions,
    enabled: activeTab === 'styles',
  });
  const charactersQuery = useLibrary<Character>('characters', {
    ...queryOptions,
    enabled: activeTab === 'characters',
  });
  const outfitsQuery = useLibrary<SimpleComponent>('outfits', {
    ...queryOptions,
    enabled: activeTab === 'outfits',
  });
  const camerasQuery = useLibrary<SimpleComponent>('cameras', {
    ...queryOptions,
    enabled: activeTab === 'cameras',
  });
  const posesQuery = useLibrary<SimpleComponent>('poses', {
    ...queryOptions,
    enabled: activeTab === 'poses',
  });
  const expressionsQuery = useLibrary<SimpleComponent>('expressions', {
    ...queryOptions,
    enabled: activeTab === 'expressions',
  });
  const backgroundsQuery = useLibrary<SimpleComponent>('backgrounds', {
    ...queryOptions,
    enabled: activeTab === 'backgrounds',
  });

  const baseModelQuery = useBaseModel();
  const updateBaseModelMutation = useUpdateBaseModel();

  const createStyles = useCreateItem('styles');
  const createCharacters = useCreateItem('characters');
  const createOutfits = useCreateItem('outfits');
  const createCameras = useCreateItem('cameras');
  const createPoses = useCreateItem('poses');
  const createExpressions = useCreateItem('expressions');
  const createBackgrounds = useCreateItem('backgrounds');

  const updateStyles = useUpdateItem('styles');
  const updateCharacters = useUpdateItem('characters');
  const updateOutfits = useUpdateItem('outfits');
  const updateCameras = useUpdateItem('cameras');
  const updatePoses = useUpdateItem('poses');
  const updateExpressions = useUpdateItem('expressions');
  const updateBackgrounds = useUpdateItem('backgrounds');

  const deleteStyles = useDeleteItem('styles');
  const deleteCharacters = useDeleteItem('characters');
  const deleteOutfits = useDeleteItem('outfits');
  const deleteCameras = useDeleteItem('cameras');
  const deletePoses = useDeleteItem('poses');
  const deleteExpressions = useDeleteItem('expressions');
  const deleteBackgrounds = useDeleteItem('backgrounds');

  const [baseModelDraft, setBaseModelDraft] = useState<BaseModel>(EMPTY_BASE_MODEL);

  useEffect(() => {
    if (!baseModelQuery.data) return;
    setBaseModelDraft(baseModelQuery.data);
  }, [baseModelQuery.data]);

  const dataMap: Record<ComponentType, Record<string, unknown>> = {
    styles: stylesQuery.data ?? {},
    characters: charactersQuery.data ?? {},
    outfits: outfitsQuery.data ?? {},
    cameras: camerasQuery.data ?? {},
    poses: posesQuery.data ?? {},
    expressions: expressionsQuery.data ?? {},
    backgrounds: backgroundsQuery.data ?? {},
  };

  const activeType = activeTab === 'base_model' ? null : activeTab;
  const filteredEntries = (() => {
    if (!activeType) return [];
    const activeData = dataMap[activeType];
    const pattern = search.trim().toLowerCase();
    const entries = Object.entries(activeData);
    if (!pattern) return entries;
    return entries.filter(([id, item]) => {
      const name = item && typeof item === 'object' && 'name' in item
          ? String((item as { name?: string }).name ?? '') : '';
      return id.toLowerCase().includes(pattern) || name.toLowerCase().includes(pattern);
    });
  })();

  const openCreateEditor = () => {
    if (!activeType) return;
    setEditor({ mode: 'create', id: '', jsonText: getCreateTemplate(activeType) });
    setEditorError('');
  };

  const openEditEditor = (id: string, item: unknown) => {
    setEditor({ mode: 'edit', id, jsonText: JSON.stringify(item, null, 2) });
    setEditorError('');
  };

  const closeEditor = () => {
    setEditor(null);
    setEditorError('');
  };

  const handleEditorIdChange = (value: string) => {
    setEditor((previous) => (previous ? { ...previous, id: value } : previous));
  };

  const handleEditorJsonChange = (value: string) => {
    setEditor((previous) => (previous ? { ...previous, jsonText: value } : previous));
  };

  const handleEditorSave = async () => {
    if (!activeType || !editor) return;
    const parsedId = editor.id.trim();
    if (!parsedId || !/^[a-z0-9_]+$/.test(parsedId)) {
      setEditorError('Valid ID is required (a-z, 0-9, _)');
      return;
    }

    let parsedData: unknown;
    try { parsedData = JSON.parse(editor.jsonText); } 
    catch { setEditorError('Invalid JSON payload'); return; }

    try {
      const mutation = editor.mode === 'create' ? {
        styles: createStyles, characters: createCharacters, outfits: createOutfits,
        cameras: createCameras, poses: createPoses, expressions: createExpressions, backgrounds: createBackgrounds
      }[activeType] : {
        styles: updateStyles, characters: updateCharacters, outfits: updateOutfits,
        cameras: updateCameras, poses: updatePoses, expressions: updateExpressions, backgrounds: updateBackgrounds
      }[activeType];

      await mutation.mutateAsync({ id: parsedId, data: parsedData });
      closeEditor();
      toast.success('Item saved');
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : 'Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!activeType || !deleteTargetId) return;
    try {
      const mutation = {
        styles: deleteStyles, characters: deleteCharacters, outfits: deleteOutfits,
        cameras: deleteCameras, poses: deletePoses, expressions: deleteExpressions, backgrounds: deleteBackgrounds
      }[activeType];
      await mutation.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
      toast.success('Item deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const handleSaveBaseModel = async () => {
    await updateBaseModelMutation.mutateAsync(baseModelDraft);
    await baseModelQuery.refetch();
    toast.success('Base model updated');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <LibraryTabs
        tabs={tabs}
        activeTab={activeTab}
        onSelect={(nextTab) => {
          setActiveTab(nextTab as TabType);
          setSearch('');
          closeEditor();
          setDeleteTargetId(null);
        }}
      />

      {activeType && (
        <section className="grid gap-6 xl:grid-cols-[2fr_1fr] items-start">
          <div className="space-y-2">
            <LibraryItemList
              model={{
                search,
                onSearchChange: setSearch,
                onAddNew: openCreateEditor,
                filteredEntries,
                activeType,
                describeItem,
                onEdit: openEditEditor,
                onDelete: setDeleteTargetId,
              }}
            />
            <p className="px-1 text-xs text-slate-500 xl:hidden">
              On mobile, Add and Edit open an editor panel from the bottom.
            </p>
          </div>

          <div className="hidden space-y-4 rounded-2xl border border-slate-700 bg-slate-900/40 p-6 backdrop-blur-sm xl:block">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Editor</p>

            {!editor ? (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500 italic">Select an item or create new</p>
              </div>
            ) : (
              <EditorForm
                editor={editor}
                editorError={editorError}
                onIdChange={handleEditorIdChange}
                onJsonChange={handleEditorJsonChange}
                onSave={() => void handleEditorSave()}
                onCancel={closeEditor}
                textareaMinHeightClass="min-h-[500px]"
              />
            )}
          </div>
        </section>
      )}

      {activeType && editor && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm xl:hidden"
          onClick={closeEditor}
        >
          <div
            className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border border-slate-700 bg-slate-900 p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Editor</p>
              <Button variant="outline" size="sm" onClick={closeEditor} className="border-slate-700">
                Close
              </Button>
            </div>
            <EditorForm
              editor={editor}
              editorError={editorError}
              onIdChange={handleEditorIdChange}
              onJsonChange={handleEditorJsonChange}
              onSave={() => void handleEditorSave()}
              onCancel={closeEditor}
              textareaMinHeightClass="min-h-[280px]"
            />
          </div>
        </div>
      )}

      {activeTab === 'base_model' && (
        <BaseModelForm
          baseModelDraft={baseModelDraft}
          setBaseModelDraft={setBaseModelDraft}
          onSave={() => void handleSaveBaseModel()}
          isSaving={updateBaseModelMutation.isPending}
        />
      )}

      {deleteTargetId && activeType && (
        <DeleteConfirmPanel
          deleteTargetId={deleteTargetId}
          activeType={activeType}
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}

export default function LibraryPage() {
  return useLibraryPageView();
}
