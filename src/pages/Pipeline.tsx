import { useState, useEffect } from "react";
import { GitBranch, ChevronRight, Circle, Activity, Wifi, WifiOff } from "lucide-react";
import { agents } from "@/lib/agentsData";
import { agentColorMap, type AgentKey } from "@/lib/agents";
import { getBakeoffs } from "@/services/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { checkWebhookConnection } from "@/services/webhookService";

type NodeStatus = "idle" | "active" | "complete";

interface PipelineNode {
  key: AgentKey;
  name: string;
  namesake: string;
  title: string;
  status: NodeStatus;
}

const Pipeline = () => {
  const [nodes, setNodes] = useState<PipelineNode[]>(
    agents.map((a) => ({ key: a.key, name: a.name, namesake: a.namesake, title: a.title, status: "idle" as NodeStatus }))
  );
  const [selected, setSelected] = useState<AgentKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentBakeoffs, setRecentBakeoffs] = useState<number>(0);
  const [webhookOnline, setWebhookOnline] = useState<boolean | null>(null);
  const { trackPageView } = useAnalytics();

  useEffect(() => { trackPageView("pipeline"); }, [trackPageView]);

  // Poll webhook status every 30s
  useEffect(() => {
    const check = () => checkWebhookConnection().then(setWebhookOnline);
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const bos = await getBakeoffs();
        setRecentBakeoffs(bos.length);
        const hasRunning = bos.some((b) => b.status === "running");
        const hasCompleted = bos.some((b) => b.status === "completed");
        if (hasRunning) {
          setNodes((prev) =>
            prev.map((n, i) => ({
              ...n,
              status: i < 3 ? "complete" : i === 3 ? "active" : "idle",
            }))
          );
        } else if (hasCompleted) {
          setNodes((prev) => prev.map((n) => ({ ...n, status: "complete" })));
        }
      } catch {
        // keep idle
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedAgent = selected ? agents.find((a) => a.key === selected) : null;

  const statusLabel: Record<NodeStatus, string> = {
    idle: "Idle",
    active: "Active",
    complete: "Complete",
  };

  const statusColor: Record<NodeStatus, string> = {
    idle: "text-muted-foreground",
    active: "text-primary animate-pulse",
    complete: "text-agent-radia",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-wrap gap-4 justify-center py-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="h-7 w-7 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Pipeline</h2>
            <p className="text-xs text-muted-foreground">Margaret's orchestration flow — {recentBakeoffs} bake-off{recentBakeoffs !== 1 ? "s" : ""} total</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          {webhookOnline === null ? (
            <Circle className="h-3 w-3 text-muted-foreground animate-pulse" />
          ) : webhookOnline ? (
            <Wifi className="h-4 w-4 text-agent-radia" />
          ) : (
            <WifiOff className="h-4 w-4 text-destructive" />
          )}
          <span className="text-xs font-medium text-muted-foreground">
            n8n {webhookOnline === null ? "…" : webhookOnline ? "Connected" : "Offline"}
          </span>
        </div>
      </div>

      {/* Pipeline flow */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-center gap-2 min-w-[700px] justify-center py-6">
          {nodes.map((node, i) => {
            const colors = agentColorMap[node.key];
            const isSelected = selected === node.key;
            return (
              <div key={node.key} className="flex items-center gap-2">
                <button
                  onClick={() => setSelected(isSelected ? null : node.key)}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 w-[120px] transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                    isSelected ? `${colors.border} ${colors.glow}` : "border-border hover:border-muted-foreground/30"
                  } bg-card`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}>
                    <span className={`text-sm font-bold ${colors.text}`}>{node.name[0]}</span>
                  </div>
                  <span className={`text-xs font-bold ${colors.text}`}>{node.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight text-center">{node.title}</span>
                  <div className={`flex items-center gap-1 ${statusColor[node.status]}`}>
                    <Circle className={`h-2 w-2 ${node.status === "complete" ? "fill-current" : node.status === "active" ? "fill-current" : ""}`} />
                    <span className="text-[10px] font-medium">{statusLabel[node.status]}</span>
                  </div>
                  {node.status === "active" && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-ping" />
                  )}
                </button>
                {i < nodes.length - 1 && (
                  <div className="flex items-center">
                    <div className={`h-0.5 w-8 transition-colors duration-500 ${
                      node.status === "complete" ? "bg-agent-radia" : node.status === "active" ? "bg-primary animate-pulse" : "bg-border"
                    }`} />
                    <ChevronRight className={`h-4 w-4 -ml-1 ${
                      node.status === "complete" ? "text-agent-radia" : node.status === "active" ? "text-primary" : "text-muted-foreground/30"
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected node detail */}
      {selectedAgent && (
        <div className="animate-fade-in rounded-xl border border-border bg-card p-6 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${agentColorMap[selectedAgent.key].bg}`}>
              <Activity className={`h-5 w-5 ${agentColorMap[selectedAgent.key].text}`} />
            </div>
            <div>
              <h3 className={`font-bold ${agentColorMap[selectedAgent.key].text}`}>{selectedAgent.name}</h3>
              <p className="text-xs text-muted-foreground">Named after {selectedAgent.namesake}</p>
            </div>
          </div>
          <p className="text-sm text-secondary-foreground">{selectedAgent.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {selectedAgent.focus.map((f) => (
              <span key={f} className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${agentColorMap[selectedAgent.key].badge}`}>
                {f}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground/60">
            Status: {statusLabel[nodes.find((n) => n.key === selectedAgent.key)?.status || "idle"]}
          </p>
        </div>
      )}

      {!selected && (
        <p className="text-center text-sm text-muted-foreground">Click any module node to view details and recent activity.</p>
      )}
    </div>
  );
};

export default Pipeline;
