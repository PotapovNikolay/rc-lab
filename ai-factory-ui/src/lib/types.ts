// Копия типов из API server с дополнениями для UI

export interface LoraDefinition {
  file: string;
  strength: number;
}

export interface LoraWithPrompts extends LoraDefinition {
  positive: string;
  negative: string;
}

export interface Style {
  name: string;
  loras: LoraWithPrompts[];
  body: {
    positive: string;
    negative: string;
    lora?: LoraDefinition;
  };
  positive: string;
  negative: string;
}

export interface Character {
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
}

export interface SimpleComponent {
  name: string;
  positive: string;
  negative: string;
  lora?: LoraDefinition;
}

export type ComponentType =
  | 'styles'
  | 'characters'
  | 'cameras'
  | 'outfits'
  | 'poses'
  | 'expressions'
  | 'backgrounds';

export interface BaseModel {
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
}

export interface Job {
  style: string;
  character: string;
  outfit: string | string[];
  camera: string | string[];
  pose: string | string[];
  expression: string | string[];
  background: string | string[];
}

export interface QueueFile {
  preset_mode: boolean;
  settings: {
    drafts_per_combination: number;
  };
  jobs: Job[];
}

export interface QueueEstimate {
  total_jobs: number;
  total_combinations: number;
  total_images: number;
  estimated_minutes: number;
}

export type GenerationStatus = 'idle' | 'running' | 'completed' | 'error' | 'stopping';

export interface GenerationStatusResponse {
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
  current_task_progress?: {
    value: number;
    max: number;
    percent: number;
  };
  elapsed_seconds: number;
  eta_seconds: number;
  errors: string[];
}

export interface HealthResponse {
  api: 'ok' | 'error';
  filesystem: 'ok' | 'error';
  comfyui: 'ok' | 'error';
  comfyui_queue: number;
  comfyui_memory?: {
    free: number;
    total: number;
  };
}

export interface OutputGroup {
  style: string;
  character: string;
  count: number;
  latest: string;
}

export interface OutputListResponse {
  total: number;
  groups: OutputGroup[];
}

export interface OutputMetadata {
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
}

export interface OutputImage {
  filename: string;
  metadata: OutputMetadata | null;
}
