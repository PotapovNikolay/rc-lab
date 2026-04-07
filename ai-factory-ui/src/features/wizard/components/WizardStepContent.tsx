import { StepBackground } from './steps/StepBackground';
import { StepCamera } from './steps/StepCamera';
import { StepCharacter } from './steps/StepCharacter';
import { StepConfirm } from './steps/StepConfirm';
import { StepExpression } from './steps/StepExpression';
import { StepOutfit } from './steps/StepOutfit';
import { StepPose } from './steps/StepPose';
import { StepStyle } from './steps/StepStyle';
import { useWizardStore } from '@/stores/wizardStore';

export function WizardStepContent() {
  const step = useWizardStore((state) => state.step);

  if (step === 1) return <StepStyle />;
  if (step === 2) return <StepCharacter />;
  if (step === 3) return <StepOutfit />;
  if (step === 4) return <StepCamera />;
  if (step === 5) return <StepPose />;
  if (step === 6) return <StepExpression />;
  if (step === 7) return <StepBackground />;
  return <StepConfirm />;
}
