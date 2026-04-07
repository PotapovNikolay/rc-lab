import { Button } from '@/shared/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWizardStore } from '@/stores/wizardStore';

export function WizardFooter() {
  const step = useWizardStore((state) => state.step);
  const style = useWizardStore((state) => state.style);
  const character = useWizardStore((state) => state.character);
  const outfitMode = useWizardStore((state) => state.outfitMode);
  const outfits = useWizardStore((state) => state.outfits);
  const cameras = useWizardStore((state) => state.cameras);
  const poses = useWizardStore((state) => state.poses);
  const expressions = useWizardStore((state) => state.expressions);
  const backgrounds = useWizardStore((state) => state.backgrounds);
  const setStep = useWizardStore((state) => state.setStep);

  const canProceedStep = (() => {
    switch (step) {
      case 1:
        return Boolean(style);
      case 2:
        return Boolean(character);
      case 3:
        return outfitMode !== 'select' || outfits.length > 0;
      case 4:
        return cameras.length > 0;
      case 5:
        return poses.length > 0;
      case 6:
        return expressions.length > 0;
      case 7:
        return backgrounds.length > 0;
      default:
        return true;
    }
  })();

  return (
    <footer className="flex items-center justify-between mt-6">
      <Button
        variant="outline"
        onClick={() => setStep(step - 1)}
        disabled={step <= 1}
        className="border-slate-600 text-slate-200"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Button
        variant="default"
        onClick={() => setStep(step + 1)}
        disabled={step >= 8 || !canProceedStep}
        className="bg-teal-600 hover:bg-teal-700 text-white"
      >
        Next
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </footer>
  );
}
