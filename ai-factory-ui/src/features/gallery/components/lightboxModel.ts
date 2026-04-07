import { OutputImage } from '@/core/types';

type SelectedGroup = {
  style: string;
  character: string;
};

export type GalleryLightboxModel = {
  activeGroup: SelectedGroup | null;
  activeImage: OutputImage | null;
  imagesLength: number;
  actionError: string;
  getImageUrl: (filename: string) => string;
  onPrev: () => void;
  onNext: () => void;
  onCopySeed: () => void;
  onRepeatInWizard: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onClose: () => void;
};
