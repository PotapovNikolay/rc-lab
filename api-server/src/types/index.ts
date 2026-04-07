// ========================================
// BASE MODEL
// ========================================

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

// ========================================
// LORA
// ========================================

export interface LoraDefinition {
  file: string;
  strength: number;
}

export interface LoraWithPrompts extends LoraDefinition {
  positive: string;
  negative: string;
}

export interface LoraInStack extends LoraDefinition {
  type: 'style' | 'character' | 'body' | 'camera' | 'pose' | 'expression' | 'background' | 'outfit';
}

// ========================================
// STYLE
// ========================================

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

// ========================================
// CHARACTER
// ========================================

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

// ========================================
// SIMPLE COMPONENTS
// ========================================

export interface SimpleComponent {
  name: string;
  positive: string;
  negative: string;
  lora?: LoraDefinition;
}

// ========================================
// LIBRARY
// ========================================

export interface Library {
  styles: Record<string, Style>;
  characters: Record<string, Character>;
  cameras: Record<string, SimpleComponent>;
  outfits: Record<string, SimpleComponent>;
  poses: Record<string, SimpleComponent>;
  expressions: Record<string, SimpleComponent>;
  backgrounds: Record<string, SimpleComponent>;
}

export type ComponentType =
  | 'styles'
  | 'characters'
  | 'cameras'
  | 'outfits'
  | 'poses'
  | 'expressions'
  | 'backgrounds';

// ========================================
// QUEUE & JOBS
// ========================================

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

// ========================================
// TASK (resolved job)
// ========================================

export interface Task {
  style: string;
  character: string;
  outfit: string; // resolved to single value: 'default', 'none', or specific ID
  camera: string; // resolved to single value
  pose: string; // resolved to single value
  expression: string; // resolved to single value
  background: string; // resolved to single value
  draft_index: number; // 1, 2, 3, ... drafts_per_combination
}

export interface ResolvedTask extends Task {
  resolved: {
    base_model: BaseModel;
    style: Style;
    character: Character;
    outfit: SimpleComponent | null; // null if 'none' or 'default'
    camera: SimpleComponent;
    pose: SimpleComponent;
    expression: SimpleComponent;
    background: SimpleComponent;
  };
}

// ========================================
// PROMPT BUILDING
// ========================================

export interface BuiltPrompt {
  final_positive: string;
  final_negative: string;
  lora_stack: LoraInStack[];
}

// ========================================
// COMFYUI
// ========================================

export interface ComfyUIWorkflow {
  [nodeId: string]: {
    inputs: Record<string, any>;
    class_type: string;
    _meta?: {
      title: string;
    };
  };
}

export interface ComfyUIPromptRequest {
  prompt: ComfyUIWorkflow;
  client_id?: string;
}

export interface ComfyUIPromptResponse {
  prompt_id: string;
  number: number;
  node_errors?: Record<string, any>;
}

export interface ComfyUIHistoryItem {
  prompt: any[];
  outputs: Record<string, {
    images?: Array<{
      filename: string;
      subfolder: string;
      type: string;
    }>;
  }>;
  status: {
    status_str: string;
    completed: boolean;
    messages?: string[][];
  };
}

export interface ComfyUIHistory {
  [promptId: string]: ComfyUIHistoryItem;
}

export interface ComfyUISystemStats {
  system: {
    ram_total: number;
    ram_free: number;
  };
  devices: Array<{
    name: string;
    type: string;
    vram_total: number;
    vram_free: number;
  }>;
}

export interface ComfyUIQueueInfo {
  queue_running: any[];
  queue_pending: any[];
}

// ========================================
// GENERATION
// ========================================

export type GenerationStatus = 'idle' | 'running' | 'completed' | 'error' | 'stopping';

export interface GenerationState {
  id: string;
  status: GenerationStatus;
  started_at: Date | null;
  completed_at: Date | null;
  tasks: Task[];
  current_task_index: number;
  completed_count: number;
  errors: string[];
  results: Array<{
    task_index: number;
    filename: string;
    path: string;
  }>;
}

export interface GenerationProgress {
  completed: number;
  total: number;
  percent: number;
}

export interface GenerationStatusResponse {
  id: string;
  status: GenerationStatus;
  progress: GenerationProgress;
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

// ========================================
// OUTPUT METADATA
// ========================================

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
  loras: LoraInStack[];
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

// ========================================
// API RESPONSES
// ========================================

export interface ApiError {
  error: string;
  code: number;
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
  latest: string; // ISO date
}

export interface OutputListResponse {
  total: number;
  groups: OutputGroup[];
}

export interface QueueEstimate {
  total_jobs: number;
  total_combinations: number;
  total_images: number;
  estimated_minutes: number;
}
