import { aiProviders, type BakeoffConfig } from "@/lib/bakeoffConfig";
import { Check, Globe } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

interface Props {
  config: BakeoffConfig;
  onChange: (config: BakeoffConfig) => void;
}

export function StepSelectAgents({ config, onChange }: Props) {
  const { track } = useAnalytics();
  const totalSelected =
    Object.values(config.selectedProviders).reduce((sum, models) => sum + models.length, 0) +
    (config.customEndpointEnabled ? 1 : 0);

  const toggleModel = (providerId: string, model: string) => {
    const current = config.selectedProviders[providerId] || [];
    const next = current.includes(model)
      ? current.filter((m) => m !== model)
      : [...current, model];
    if (!current.includes(model)) {
      track("agent_selected", { provider: providerId, model });
    }
    const selectedProviders = { ...config.selectedProviders };
    if (next.length === 0) delete selectedProviders[providerId];
    else selectedProviders[providerId] = next;
    onChange({ ...config, selectedProviders });
  };

  const toggleAllModels = (providerId: string, models: string[]) => {
    const current = config.selectedProviders[providerId] || [];
    const allSelected = models.every((m) => current.includes(m));
    const selectedProviders = { ...config.selectedProviders };
    if (allSelected) delete selectedProviders[providerId];
    else selectedProviders[providerId] = [...models];
    onChange({ ...config, selectedProviders });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground">Select AI Agents</h3>
        <p className="text-sm text-muted-foreground">
          Choose at least 2 agents to compare.{" "}
          <span className={totalSelected >= 2 ? "text-primary font-medium" : "text-destructive font-medium"}>
            {totalSelected} selected
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {aiProviders.map((provider) => {
          const selected = config.selectedProviders[provider.id] || [];
          const anySelected = selected.length > 0;

          return (
            <div
              key={provider.id}
              className={`rounded-xl border-2 p-4 transition-all duration-200 ${
                anySelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAllModels(provider.id, provider.models)}
                className="flex w-full items-center gap-3 text-left"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold ${
                    anySelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {provider.icon}
                </div>
                <div className="flex-1">
                  <span className={`font-semibold ${anySelected ? "text-foreground" : "text-secondary-foreground"}`}>
                    {provider.name}
                  </span>
                  <p className="text-xs text-muted-foreground">{provider.models.length} model{provider.models.length > 1 ? "s" : ""}</p>
                </div>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                    selected.length === provider.models.length
                      ? "border-primary bg-primary text-primary-foreground"
                      : anySelected
                      ? "border-primary bg-primary/30"
                      : "border-border"
                  }`}
                >
                  {selected.length === provider.models.length && <Check className="h-3 w-3" />}
                </div>
              </button>

              <div className="mt-3 flex flex-wrap gap-2">
                {provider.models.map((model) => {
                  const isSelected = selected.includes(model);
                  return (
                    <button
                      key={model}
                      type="button"
                      onClick={() => toggleModel(provider.id, model)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-primary/50 bg-primary/15 text-primary"
                          : "border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {model}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Custom Agent */}
        <div
          className={`rounded-xl border-2 p-4 transition-all duration-200 ${
            config.customEndpointEnabled ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground/30"
          }`}
        >
          <button
            type="button"
            onClick={() => onChange({ ...config, customEndpointEnabled: !config.customEndpointEnabled })}
            className="flex w-full items-center gap-3 text-left"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                config.customEndpointEnabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              <Globe className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <span className={`font-semibold ${config.customEndpointEnabled ? "text-foreground" : "text-secondary-foreground"}`}>
                Custom Agent
              </span>
              <p className="text-xs text-muted-foreground">Your own API endpoint</p>
            </div>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                config.customEndpointEnabled
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {config.customEndpointEnabled && <Check className="h-3 w-3" />}
            </div>
          </button>

          {config.customEndpointEnabled && (
            <div className="mt-3 animate-fade-in">
              <input
                type="url"
                placeholder="https://your-api.example.com/v1/chat"
                value={config.customEndpoint}
                onChange={(e) => onChange({ ...config, customEndpoint: e.target.value })}
                className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
