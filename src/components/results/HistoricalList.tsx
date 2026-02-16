import { Calendar, Trophy, Users } from "lucide-react";
import type { BakeoffRow, ResultRow } from "@/lib/resultsHelpers";

interface Props {
  bakeoffs: BakeoffRow[];
  allResults: Map<string, ResultRow[]>;
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export function HistoricalList({ bakeoffs, allResults, onSelect, selectedId }: Props) {
  const completed = bakeoffs.filter((b) => b.status === "completed");

  if (completed.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <p className="text-muted-foreground">No completed bake-offs yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {completed.map((b) => {
        const res = allResults.get(b.id) || [];
        const winner = res.length > 0 ? [...res].sort((a, b) => b.overall_score - a.overall_score)[0] : null;
        const active = selectedId === b.id;

        return (
          <button
            key={b.id}
            onClick={() => onSelect(b.id)}
            className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 ${
              active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{b.name}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(b.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {res.length} agents
                  </span>
                </div>
              </div>
              {winner && (
                <div className="flex items-center gap-2 text-right">
                  <Trophy className="h-4 w-4 text-agent-margaret" />
                  <div>
                    <p className="text-xs text-muted-foreground">Winner</p>
                    <p className="text-sm font-bold text-foreground">{winner.agent_name}</p>
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
