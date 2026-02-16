import { agentColorMap, type AgentKey } from "@/lib/agents";
import type { AgentData } from "@/lib/agentsData";
import {
  Search, Shield, Network, Users, Cpu, Sparkles,
} from "lucide-react";

const iconMap: Record<AgentKey, React.ElementType> = {
  ada: Search,
  grace: Sparkles,
  hedy: Shield,
  radia: Network,
  anita: Users,
  margaret: Cpu,
};

export function AgentCard({ agent }: { agent: AgentData }) {
  const colors = agentColorMap[agent.key];
  const Icon = iconMap[agent.key];

  return (
    <div
      className={`group relative rounded-xl border-2 ${colors.border} bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:${colors.glow}`}
    >
      {/* Accent top bar */}
      <div className={`absolute inset-x-0 top-0 h-1 rounded-t-xl ${colors.bg}`} style={{ backgroundColor: `hsl(var(--agent-${agent.key}))` }} />

      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg}`}>
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>
        <div className="min-w-0">
          <h3 className={`text-lg font-bold ${colors.text}`}>{agent.name}</h3>
          <p className="text-xs text-muted-foreground">{agent.title}</p>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground italic">
        Named after{" "}
        <a href={agent.wikiUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">
          {agent.namesake}
        </a>
      </p>

      <p className="mt-3 text-sm leading-relaxed text-secondary-foreground">
        {agent.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {agent.focus.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${colors.badge}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
