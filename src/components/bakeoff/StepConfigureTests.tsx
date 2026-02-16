import { testTypes, type BakeoffConfig, type Complexity } from "@/lib/bakeoffConfig";
import { Brain, Code, Shield, Users, Pencil, Check } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  brain: Brain,
  code: Code,
  shield: Shield,
  users: Users,
  pencil: Pencil,
};

const complexityOptions: { value: Complexity; label: string; description: string }[] = [
  { value: "basic", label: "Basic", description: "Quick validation run" },
  { value: "standard", label: "Standard", description: "Balanced evaluation" },
  { value: "advanced", label: "Advanced", description: "Deep comprehensive analysis" },
];

interface Props {
  config: BakeoffConfig;
  onChange: (config: BakeoffConfig) => void;
}

export function StepConfigureTests({ config, onChange }: Props) {
  const toggleTest = (id: string) => {
    const next = config.selectedTests.includes(id)
      ? config.selectedTests.filter((t) => t !== id)
      : [...config.selectedTests, id];
    onChange({ ...config, selectedTests: next });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground">Configure Tests</h3>
        <p className="text-sm text-muted-foreground">Select evaluation tests and complexity level.</p>
      </div>

      <div className="space-y-3">
        {testTypes.map((test) => {
          const selected = config.selectedTests.includes(test.id);
          const Icon = iconMap[test.icon] || Brain;
          return (
            <button
              key={test.id}
              type="button"
              onClick={() => toggleTest(test.id)}
              className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  selected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-semibold ${selected ? "text-foreground" : "text-secondary-foreground"}`}>
                  {test.label}
                </span>
                <p className="text-xs text-muted-foreground">{test.description}</p>
              </div>
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                }`}
              >
                {selected && <Check className="h-3 w-3" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom prompt */}
      {config.selectedTests.includes("custom") && (
        <div className="animate-fade-in">
          <label className="mb-1.5 block text-sm font-medium text-foreground">Custom Prompt</label>
          <textarea
            rows={4}
            placeholder="Enter your evaluation prompt..."
            value={config.customPrompt}
            onChange={(e) => onChange({ ...config, customPrompt: e.target.value })}
            className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
      )}

      {/* Complexity */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Test Complexity</label>
        <div className="grid grid-cols-3 gap-3">
          {complexityOptions.map((opt) => {
            const active = config.complexity === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...config, complexity: opt.value })}
                className={`rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                  active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <span className={`block text-sm font-semibold ${active ? "text-primary" : "text-secondary-foreground"}`}>
                  {opt.label}
                </span>
                <span className="block text-[11px] text-muted-foreground mt-0.5">{opt.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
