// Core domain types

export type LoraDefinition = {
  file: string;
  strength: number;
};

export type LoraWithPrompts = LoraDefinition & {
  positive: string;
  negative: string;
};

export type Style = {
  name: string;
  loras: LoraWithPrompts[];
  body: {
    positive: string;
    negative: string;
    lora?: LoraDefinition;
  };
  positive: string;
  negative: string;
};

export type Character = {
  name: string;
  source: string;
  weight: number;
  lora: LoraDefinition;
  appearance: {
    positive: string;
    negative: string;
  };
  default_outfit: {
    positive: string;
    negative: string;
  };
  positive: string;
  negative: string;
};

export type SimpleComponent = {
  name: string;
  positive: string;
  negative: string;
  lora?: LoraDefinition;
};

export type ComponentType =
  | 'styles'
  | 'characters'
  | 'cameras'
  | 'outfits'
  | 'poses'
  | 'expressions'
  | 'backgrounds';

export type BaseModel = {
  checkpoint: string;
  settings: {
    width: number;
    height: number;
    steps: number;
    cfg: number;
    sampler: string;
    scheduler: string;
    clip_skip: number;
  };
  positive: string;
  negative: string;
};

export type Job = {
  style: string;
  character: string;
  outfit: string | string[];
  camera: string | string[];
  pose: string | string[];
  expression: string | string[];
  background: string | string[];
};

export type QueueFile = {
  preset_mode: boolean;
  settings: {
    drafts_per_combination: number;
  };
  jobs: Job[];
};

export type QueueEstimate = {
  total_jobs: number;
  total_combinations: number;
  total_images: number;
  estimated_minutes: number;
};

export type GenerationStatus = 'idle' | 'running' | 'completed' | 'error' | 'stopping';

export type GenerationStatusResponse = {
  id: string;
  status: GenerationStatus;
  progress: {
    completed: number;
    total: number;
    percent: number;
  };
  current_task: {
    character: string;
    pose: string;
    camera: string;
    outfit: string;
  } | null;
  elapsed_seconds: number;
  eta_seconds: number;
  errors: string[];
};

export type HealthResponse = {
  api: 'ok' | 'error';
  filesystem: 'ok' | 'error';
  comfyui: 'ok' | 'error';
  comfyui_queue: number;
  comfyui_memory?: {
    free: number;
    total: number;
  };
};

export type OutputGroup = {
  style: string;
  character: string;
  count: number;
  latest: string;
};

export type OutputListResponse = {
  total: number;
  groups: OutputGroup[];
};

export type OutputMetadata = {
  generated: string;
  seed: number;
  task_index: number;
  total_tasks: number;
  checkpoint: string;
  settings: BaseModel['settings'];
  components: {
    style: string;
    character: string;
    outfit: string;
    camera: string;
    pose: string;
    expression: string;
    background: string;
  };
  loras: Array<{
    file: string;
    strength: number;
    type: string;
  }>;
  prompt: {
    positive: string;
    negative: string;
  };
  source_data: {
    style: Style;
    character: Character;
    outfit: SimpleComponent | null;
    camera: SimpleComponent;
    pose: SimpleComponent;
    expression: SimpleComponent;
    background: SimpleComponent;
  };
};

export type OutputImage = {
  filename: string;
  metadata: OutputMetadata | null;
};
