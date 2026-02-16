import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, Loader2, CheckCircle2, Clock, XCircle, Square } from "lucide-react";
import { type AgentProgress, runEvaluation } from "@/services/evaluationEngine";
import type { BakeoffConfig } from "@/lib/bakeoffConfig";
import { hasAnyApiKey } from "@/lib/apiKeys";
import { useAnalytics } from "@/hooks/useAnalytics";

interface Props {
  bakeoffId: string;
  config: BakeoffConfig;
  onClose: () => void;
}

export function BakeoffMonitor({ bakeoffId, config, onClose }: Props) {
  const [agents, setAgents] = useState<AgentProgress[]>([]);
  const [pct, setPct] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController>(new AbortController());
  const logEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isDemo = !hasAnyApiKey();
  const { track } = useAnalytics();

  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    runEvaluation(bakeoffId, config, {
      onProgress: (a, p) => { setAgents(a); setPct(p); },
      onLog: (msg) => setLogs((l) => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`]),
      onComplete: () => { setDone(true); track("bakeoff_completed", { bakeoff_id: bakeoffId }); },
      onError: (err) => setError(err),
    }, ctrl.signal);

    return () => ctrl.abort();
  }, [bakeoffId, config]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCancel = () => {
    abortRef.current.abort();
    onClose();
  };

  const statusIcon = (s: AgentProgress["status"]) => {
    switch (s) {
      case "waiting": return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "running": return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case "complete": return <CheckCircle2 className="h-4 w-4 text-agent-radia" />;
      case "error": return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-7 w-7 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {done ? "Evaluation Complete" : "Running Bake-off..."}
            </h2>
            {isDemo && !done && (
              <p className="text-xs text-agent-anita font-medium">Demo Mode — simulated scores</p>
            )}
          </div>
        </div>
        {!done && (
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 rounded-lg border border-destructive/50 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Square className="h-3.5 w-3.5" />
            Cancel
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-foreground">Overall Progress</span>
          <span className="text-sm font-bold font-mono text-primary">{pct}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Agent status cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className={`rounded-xl border p-3 transition-all duration-300 ${
              agent.status === "complete"
                ? "border-agent-radia/30 bg-agent-radia/5"
                : agent.status === "running"
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusIcon(agent.status)}
              <span className="text-sm font-medium text-foreground truncate">{agent.name}</span>
            </div>
            {agent.status === "complete" && agent.overallScore != null && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Score</span>
                <span className="text-lg font-bold font-mono text-foreground">{agent.overallScore}</span>
              </div>
            )}
            {agent.status === "complete" && agent.executionTimeMs != null && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{agent.executionTimeMs}ms</p>
            )}
          </div>
        ))}
      </div>

      {/* Log feed */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Log</span>
        </div>
        <div className="h-48 overflow-y-auto p-3 font-mono text-xs text-muted-foreground space-y-0.5">
          {logs.map((log, i) => (
            <p key={i} className={log.includes("✓") ? "text-agent-radia" : log.includes("Error") ? "text-destructive" : ""}>{log}</p>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {done && (
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/results?bakeoff=${bakeoffId}`)}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View Results
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            New Bake-off
          </button>
        </div>
      )}
    </div>
  );
}
