import { QuickAddType } from '@/features/wizard/types';

export type QuickAddFormProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export type QuickAddModel = {
  isOpen: boolean;
  type: QuickAddType | null;
  id: string;
  isSaving: boolean;
  error: string | null;
  onIdChange: (id: string) => void;
  onClose: () => void;
  onSave: () => void;
};
