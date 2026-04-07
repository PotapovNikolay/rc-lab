export type GalleryGroup = {
  style: string;
  character: string;
  count: number;
  latest: string;
};

export type GalleryImage = {
  filename: string;
  url: string;
  thumbUrl: string;
};

export type LightboxModel = {
  isOpen: boolean;
  images: GalleryImage[];
  currentIndex: number;
  style: string;
  character: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDelete: (filename: string) => Promise<void>;
};
