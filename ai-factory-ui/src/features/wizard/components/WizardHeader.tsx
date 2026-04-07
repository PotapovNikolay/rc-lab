import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { useWizardStore } from '@/stores/wizardStore';
import { WIZARD_STEP_LABELS } from '../constants';

export function WizardHeader() {
  const step = useWizardStore((state) => state.step);
  const setStep = useWizardStore((state) => state.setStep);

  return (
    <header>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">Wizard</p>
      <h2 className="mt-2 text-xl font-bold text-slate-100">
        Step {step}/8 - {WIZARD_STEP_LABELS[step - 1]}
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {WIZARD_STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const active = stepNumber === step;
          return (
            <Button
              key={label}
              variant={active ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStep(stepNumber)}
              className={cn(
                'h-8 w-8 p-0 text-xs',
                active
                  ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-500'
                  : 'border-slate-700 bg-slate-800/70 text-slate-300'
              )}
            >
              {stepNumber}
            </Button>
          );
        })}
      </div>
    </header>
  );
}
