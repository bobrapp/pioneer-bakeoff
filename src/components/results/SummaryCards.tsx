import { Cpu, Clock, TrendingUp } from "lucide-react";
import type { ResultRow } from "@/lib/resultsHelpers";
import { parseScores } from "@/lib/resultsHelpers";

interface Props {
  results: ResultRow[];
}

export function SummaryCards({ results }: Props) {
  const avgScore = results.length
    ? Math.round((results.reduce((s, r) => s + r.overall_score, 0) / results.length) * 10) / 10
    : 0;
  const avgTime = results.length
    ? Math.round(results.reduce((s, r) => s + r.execution_time_ms, 0) / results.length)
    : 0;

  const allScores = results.flatMap((r) => Object.values(parseScores(r.criteria_scores)));
  const maxSingleScore = allScores.length ? Math.max(...allScores) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Cpu className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Agents Tested</span>
        </div>
        <p className="text-3xl font-bold text-foreground">{results.length}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Avg Score</span>
        </div>
        <p className="text-3xl font-bold text-foreground">{avgScore}</p>
        <p className="text-xs text-muted-foreground mt-1">Peak: {maxSingleScore}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Clock className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Avg Response Time</span>
        </div>
        <p className="text-3xl font-bold text-foreground">{avgTime}<span className="text-sm text-muted-foreground font-normal">ms</span></p>
      </div>
    </div>
  );
}
