import { useEffect, useState } from "react";
import { LayoutDashboard, FlaskConical, Trophy, Clock, Zap, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBakeoffs, getResults } from "@/services/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";

interface BakeoffSummary {
  id: string;
  name: string;
  status: string;
  created_at: string;
  winner?: string;
  agentCount?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, mostTested: "—", highestScorer: "—", highestScore: 0 });
  const [recent, setRecent] = useState<BakeoffSummary[]>([]);

  const { trackPageView } = useAnalytics();

  useEffect(() => { trackPageView("dashboard"); }, [trackPageView]);

  useEffect(() => {
    (async () => {
      try {
        const bos = await getBakeoffs();
        const completed = bos.filter((b) => b.status === "completed");
        const agentCounts: Record<string, number> = {};
        const agentScores: Record<string, number[]> = {};

        const summaries: BakeoffSummary[] = [];
        for (const b of bos.slice(0, 5)) {
          const s: BakeoffSummary = { id: b.id, name: b.name, status: b.status, created_at: b.created_at };
          if (b.status === "completed") {
            try {
              const res = await getResults(b.id);
              s.agentCount = res.length;
              if (res.length > 0) {
                s.winner = res[0].agent_name;
                res.forEach((r) => {
                  agentCounts[r.agent_name] = (agentCounts[r.agent_name] || 0) + 1;
                  if (!agentScores[r.agent_name]) agentScores[r.agent_name] = [];
                  agentScores[r.agent_name].push(r.overall_score);
                });
              }
            } catch { /* skip */ }
          }
          summaries.push(s);
        }

        const mostTested = Object.entries(agentCounts).sort((a, b) => b[1] - a[1])[0];
        const highestScorer = Object.entries(agentScores)
          .map(([name, scores]) => ({ name, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
          .sort((a, b) => b.avg - a.avg)[0];

        setStats({
          total: bos.length,
          mostTested: mostTested ? mostTested[0] : "—",
          highestScorer: highestScorer ? highestScorer.name : "—",
          highestScore: highestScorer ? Math.round(highestScorer.avg) : 0,
        });
        setRecent(summaries);
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: "bg-agent-radia/20 text-agent-radia",
      running: "bg-primary/20 text-primary",
      pending: "bg-agent-margaret/20 text-agent-margaret",
      failed: "bg-destructive/20 text-destructive",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-7 w-7 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Bake-offs", value: String(stats.total), icon: FlaskConical, color: "text-primary" },
          { label: "Most Tested Agent", value: stats.mostTested, icon: Zap, color: "text-agent-anita" },
          { label: "Highest Scorer", value: stats.highestScorer, icon: Trophy, color: "text-agent-margaret" },
          { label: "Top Score", value: stats.highestScore ? `${stats.highestScore}%` : "—", icon: BarChart3, color: "text-agent-radia" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Recent Activity</h3>
        {recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
            <FlaskConical className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <p className="mt-3 text-muted-foreground">No bake-offs yet.</p>
            <button
              onClick={() => navigate("/run")}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <FlaskConical className="h-4 w-4" />
              Run Your First Bake-off
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((b) => (
              <button
                key={b.id}
                onClick={() => b.status === "completed" ? navigate(`/results?bakeoff=${b.id}`) : undefined}
                className="flex w-full items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
              >
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</p>
                </div>
                {b.winner && <span className="text-xs text-muted-foreground">Winner: {b.winner}</span>}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusBadge(b.status)}`}>
                  {b.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick start */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Quick Start</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Quick Demo", desc: "Run all agents in demo mode", path: "/run" },
            { label: "View Results", desc: "See latest bake-off results", path: "/results" },
            { label: "Agent Gallery", desc: "Explore all 6 pioneer agents", path: "/" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent hover:border-muted-foreground/30"
            >
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
