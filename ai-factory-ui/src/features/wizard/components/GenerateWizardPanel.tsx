import { WizardFooter } from './WizardFooter';
import { WizardHeader } from './WizardHeader';
import { WizardStepContent } from './WizardStepContent';

export function GenerateWizardPanel() {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/40 p-6 backdrop-blur-sm">
      <WizardHeader />
      <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950/40 p-5 min-h-[400px]">
        <WizardStepContent />
      </div>
      <WizardFooter />
    </section>
  );
}
