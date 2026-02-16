import { evalCriteria, type BakeoffConfig } from "@/lib/bakeoffConfig";
import { RotateCcw } from "lucide-react";

interface Props {
  config: BakeoffConfig;
  onChange: (config: BakeoffConfig) => void;
}

export function StepSetCriteria({ config, onChange }: Props) {
  const totalWeight = Object.values(config.weights).reduce((a, b) => a + b, 0);

  const setWeight = (id: string, value: number) => {
    onChange({ ...config, weights: { ...config.weights, [id]: value } });
  };

  const resetEqual = () => {
    const equal = Math.round(100 / evalCriteria.length);
    const weights = Object.fromEntries(evalCriteria.map((c) => [c.id, equal]));
    onChange({ ...config, weights });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Set Evaluation Criteria</h3>
          <p className="text-sm text-muted-foreground">Adjust weights for each benchmark dimension.</p>
        </div>
        <button
          type="button"
          onClick={resetEqual}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to Equal
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Total Weight</span>
          <span
            className={`text-lg font-bold font-mono ${
              totalWeight === 100 ? "text-primary" : totalWeight > 100 ? "text-destructive" : "text-agent-anita"
            }`}
          >
            {totalWeight}
            <span className="text-sm text-muted-foreground font-normal"> / 100</span>
          </span>
        </div>

        <div className="space-y-5">
          {evalCriteria.map((criterion) => {
            const value = config.weights[criterion.id] ?? 0;
            return (
              <div key={criterion.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm font-medium text-foreground">{criterion.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{criterion.description}</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-primary w-8 text-right">{value}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) => setWeight(criterion.id, Number(e.target.value))}
                    className="flex-1 h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md
                      [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                  />
                </div>
                {/* visual bar */}
                <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all duration-200"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
