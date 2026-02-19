import { useState, useEffect } from "react";
import { Settings, Eye, EyeOff, Save, Key, Webhook, Loader2 } from "lucide-react";
import { getApiKeys, saveApiKeys, type ApiKeys } from "@/lib/apiKeys";
import { getWebhookUrl, saveWebhookUrl, checkWebhookConnection, isValidWebhookUrl } from "@/services/webhookService";
import { toast } from "sonner";

const keyFields: { id: keyof ApiKeys; label: string; placeholder: string }[] = [
  { id: "openai", label: "OpenAI API Key", placeholder: "sk-..." },
  { id: "anthropic", label: "Anthropic API Key", placeholder: "sk-ant-..." },
  { id: "google", label: "Google Gemini API Key", placeholder: "AIza..." },
];

const SettingsPage = () => {
  const [keys, setKeys] = useState<ApiKeys>(getApiKeys);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [webhookUrl, setWebhookUrl] = useState(getWebhookUrl);
  const [webhookStatus, setWebhookStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    checkWebhookConnection().then((ok) => setWebhookStatus(ok ? "online" : "offline"));
  }, []);

  const toggleVisibility = (id: string) =>
    setVisible((v) => ({ ...v, [id]: !v[id] }));

  const handleSave = () => {
    try {
      saveApiKeys(keys);
      saveWebhookUrl(webhookUrl);
      toast.success("Settings saved.");
      setWebhookStatus("checking");
      checkWebhookConnection().then((ok) => setWebhookStatus(ok ? "online" : "offline"));
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings.");
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Settings className="h-7 w-7 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
      </div>

      {/* API Keys */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            API Keys
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your API keys to run live evaluations. Keys are stored in session storage and cleared when you close the browser tab.
            Without keys, bake-offs run in <span className="text-primary font-medium">Demo Mode</span> with simulated scores.
          </p>
          <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
            ⚠️ API keys are stored client-side for convenience. Avoid entering keys on shared or untrusted devices.
          </p>
        </div>

        {keyFields.map((field) => (
          <div key={field.id}>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {field.label}
            </label>
            <div className="relative">
              <input
                type={visible[field.id] ? "text" : "password"}
                value={keys[field.id]}
                onChange={(e) => setKeys((k) => ({ ...k, [field.id]: e.target.value }))}
                placeholder={field.placeholder}
                maxLength={256}
                className="w-full rounded-lg border border-border bg-muted/50 py-2.5 pl-3 pr-10 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => toggleVisibility(field.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {visible[field.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Webhook */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            n8n Webhook
            {webhookStatus === "checking" ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <span className={`inline-flex h-2.5 w-2.5 rounded-full ${webhookStatus === "online" ? "bg-agent-radia" : "bg-destructive"}`} title={webhookStatus === "online" ? "Connected" : "Unreachable"} />
            )}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure a webhook URL (HTTPS only) to receive automated notifications when bake-offs are started, completed, or results are exported.
            {webhookStatus !== "checking" && (
              <span className={`ml-1 font-medium ${webhookStatus === "online" ? "text-agent-radia" : "text-destructive"}`}>
                ({webhookStatus === "online" ? "Connected" : "Unreachable"})
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
            ⚠️ Summary data (IDs, counts, format) will be sent to this URL. No raw AI responses or API keys are included.
          </p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Webhook URL</label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-n8n.example.com/webhook/..."
            className="w-full rounded-lg border border-border bg-muted/50 py-2.5 px-3 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Events sent: <code className="text-primary">bakeoff_started</code>, <code className="text-primary">bakeoff_completed</code>, <code className="text-primary">results_exported</code>
        </p>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Save className="h-4 w-4" />
        Save Settings
      </button>

      <div className="rounded-xl border border-dashed border-border bg-card/50 p-5">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Demo Mode:</span> If no API keys are configured, the evaluation engine
          will generate realistic simulated scores based on published model benchmarks, with a brief delay to mimic API calls.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
