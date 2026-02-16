import { aiProviders, evalCriteria, testTypes, type BakeoffConfig } from "@/lib/bakeoffConfig";
import { Rocket, Clock, Cpu } from "lucide-react";
import { toast } from "sonner";

interface Props {
  config: BakeoffConfig;
}

export function StepReviewLaunch({ config }: Props) {
  const selectedModels: string[] = [];
  for (const [pid, models] of Object.entries(config.selectedProviders)) {
    const provider = aiProviders.find((p) => p.id === pid);
    models.forEach((m) => selectedModels.push(`${provider?.name ?? pid} – ${m}`));
  }
  if (config.customEndpointEnabled) selectedModels.push("Custom Agent");

  const topCriteria = Object.entries(config.weights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, w]) => {
      const c = evalCriteria.find((c) => c.id === id);
      return `${c?.label ?? id} (${w})`;
    });

  const selectedTestLabels = config.selectedTests.map(
    (id) => testTypes.find((t) => t.id === id)?.label ?? id
  );

  const estimatedMinutes = selectedModels.length * config.selectedTests.length * (config.complexity === "advanced" ? 5 : config.complexity === "standard" ? 3 : 1);

  const handleLaunch = () => {
    toast.success("Bake-off started!", { description: `Evaluating ${selectedModels.length} agents across ${config.selectedTests.length} tests.` });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground">Review & Launch</h3>
        <p className="text-sm text-muted-foreground">Confirm your configuration before starting.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Cpu className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Agents</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{selectedModels.length}</p>
          <div className="mt-2 space-y-1">
            {selectedModels.map((m) => (
              <p key={m} className="text-xs text-muted-foreground truncate">{m}</p>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Time</span>
          </div>
          <p className="text-2xl font-bold text-foreground">~{estimatedMinutes} min</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Complexity: <span className="capitalize text-foreground">{config.complexity}</span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Criteria</span>
          </div>
          <div className="space-y-1 mt-1">
            {topCriteria.map((c) => (
              <p key={c} className="text-sm text-foreground">{c}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Tests */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tests</p>
        <div className="flex flex-wrap gap-2">
          {selectedTestLabels.map((t) => (
            <span key={t} className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {t}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleLaunch}
        className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
      >
        <Rocket className="h-6 w-6" />
        Start Bake-off
      </button>
    </div>
  );
}
