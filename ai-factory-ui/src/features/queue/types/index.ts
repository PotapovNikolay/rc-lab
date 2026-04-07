import { Job } from '@/core/types';

export type QueuePanelModel = {
  queue: Job[];
  queueImages: number;
  queueEtaMinutes: number;
  draggedQueueIndex: number | null;
  isSavingQueue: boolean;
  isRunning: boolean;
  isStarting: boolean;
  isStopping: boolean;
  generationStatus?: string;
  getStyleName: (id: string) => string;
  getCharacterName: (id: string) => string;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onDropAt: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (index: number) => void;
  onLoadApiQueue: () => void;
  onSaveQueue: () => void;
  onRunQueue: () => void;
  onStopGeneration: () => void;
  onClearQueue: () => void;
};
