import { useState } from "react";
import { FlaskConical, ArrowLeft, ArrowRight } from "lucide-react";
import { defaultConfig, type BakeoffConfig } from "@/lib/bakeoffConfig";
import { WizardStepper } from "@/components/bakeoff/WizardStepper";
import { StepSelectAgents } from "@/components/bakeoff/StepSelectAgents";
import { StepSetCriteria } from "@/components/bakeoff/StepSetCriteria";
import { StepConfigureTests } from "@/components/bakeoff/StepConfigureTests";
import { StepReviewLaunch } from "@/components/bakeoff/StepReviewLaunch";
import { BakeoffMonitor } from "@/components/bakeoff/BakeoffMonitor";

const STEPS = ["Select Agents", "Set Criteria", "Configure Tests", "Review & Launch"];

const RunBakeoff = () => {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<BakeoffConfig>({ ...defaultConfig });
  const [runningBakeoff, setRunningBakeoff] = useState<{ id: string; config: BakeoffConfig } | null>(null);

  const totalAgents =
    Object.values(config.selectedProviders).reduce((s, m) => s + m.length, 0) +
    (config.customEndpointEnabled ? 1 : 0);

  const canNext = (): boolean => {
    if (step === 0) return totalAgents >= 2;
    if (step === 2) return config.selectedTests.length > 0;
    return true;
  };

  const handleLaunched = (bakeoffId: string) => {
    setRunningBakeoff({ id: bakeoffId, config: { ...config } });
  };

  const handleCloseMonitor = () => {
    setRunningBakeoff(null);
    setStep(0);
    setConfig({ ...defaultConfig });
  };

  if (runningBakeoff) {
    return (
      <BakeoffMonitor
        bakeoffId={runningBakeoff.id}
        config={runningBakeoff.config}
        onClose={handleCloseMonitor}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <FlaskConical className="h-7 w-7 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Run Bake-off</h2>
      </div>

      <WizardStepper steps={STEPS} currentStep={step} />

      <div className="min-h-[400px]" key={step}>
        {step === 0 && <StepSelectAgents config={config} onChange={setConfig} />}
        {step === 1 && <StepSetCriteria config={config} onChange={setConfig} />}
        {step === 2 && <StepConfigureTests config={config} onChange={setConfig} />}
        {step === 3 && <StepReviewLaunch config={config} onLaunched={handleLaunched} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {step < 3 && (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default RunBakeoff;
