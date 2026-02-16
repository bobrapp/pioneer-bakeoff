import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { evalCriteria } from "@/lib/bakeoffConfig";
import { parseScores, scoreColor, scoreBg, rankBadge, getStrengths, getWeaknesses, type ResultRow } from "@/lib/resultsHelpers";

interface Props {
  results: ResultRow[];
}

type SortKey = "overall_score" | "agent_name" | "execution_time_ms" | string;

export function ComparisonTable({ results }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("overall_score");
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sorted = [...results].sort((a, b) => {
    let av: number | string, bv: number | string;
    if (sortKey === "overall_score") { av = a.overall_score; bv = b.overall_score; }
    else if (sortKey === "agent_name") { av = a.agent_name; bv = b.agent_name; }
    else if (sortKey === "execution_time_ms") { av = a.execution_time_ms; bv = b.execution_time_ms; }
    else {
      av = (parseScores(a.criteria_scores)[sortKey]) ?? 0;
      bv = (parseScores(b.criteria_scores)[sortKey]) ?? 0;
    }
    if (typeof av === "string") return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  // Rank by overall_score descending
  const ranked = [...results].sort((a, b) => b.overall_score - a.overall_score);

  const SortHeader = ({ label, keyName, className = "" }: { label: string; keyName: SortKey; className?: string }) => (
    <th
      className={`px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none ${className}`}
      onClick={() => handleSort(keyName)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey === keyName ? (
          sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30" />
        )}
      </span>
    </th>
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-8">#</th>
              <SortHeader label="Agent" keyName="agent_name" />
              <SortHeader label="Overall" keyName="overall_score" />
              {evalCriteria.map((c) => (
                <SortHeader key={c.id} label={c.label} keyName={c.id} />
              ))}
              <SortHeader label="Time" keyName="execution_time_ms" />
              <th className="px-3 py-2.5 w-8" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const scores = parseScores(r.criteria_scores);
              const rank = ranked.findIndex((rr) => rr.id === r.id) + 1;
              const badge = rankBadge(rank);
              const isExpanded = expanded === r.id;

              return (
                <>
                  <tr
                    key={r.id}
                    className={`border-b border-border/50 cursor-pointer transition-colors ${isExpanded ? "bg-primary/5" : "hover:bg-muted/30"}`}
                    onClick={() => setExpanded(isExpanded ? null : r.id)}
                  >
                    <td className="px-3 py-3">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-foreground">{r.agent_name}</p>
                      <p className="text-[11px] text-muted-foreground">{r.provider}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-lg font-bold font-mono ${scoreColor(r.overall_score)}`}>
                        {r.overall_score}
                      </span>
                    </td>
                    {evalCriteria.map((c) => {
                      const val = scores[c.id] ?? 0;
                      return (
                        <td key={c.id} className="px-3 py-3">
                          <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-mono font-medium ${scoreBg(val)} ${scoreColor(val)}`}>
                            {val}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-xs text-muted-foreground font-mono">{r.execution_time_ms}ms</td>
                    <td className="px-3 py-3">
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${r.id}-detail`}>
                      <td colSpan={evalCriteria.length + 4} className="px-6 py-5 bg-muted/10">
                        <AgentDetail result={r} scores={scores} rank={rank} />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AgentDetail({ result, scores, rank }: { result: ResultRow; scores: Record<string, number>; rank: number }) {
  const strengths = getStrengths(scores);
  const weaknesses = getWeaknesses(scores);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Score breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Score Breakdown</h4>
          <div className="space-y-2">
            {evalCriteria.map((c) => {
              const val = scores[c.id] ?? 0;
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-muted-foreground">{c.label}</span>
                    <span className={`text-xs font-bold font-mono ${scoreColor(val)}`}>{val}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${val > 80 ? "bg-agent-radia" : val >= 50 ? "bg-agent-anita" : "bg-destructive"}`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">✅ Strengths</h4>
            {strengths.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {strengths.map((s) => (
                  <span key={s} className="rounded-full border border-agent-radia/30 bg-agent-radia/10 px-2.5 py-0.5 text-xs text-agent-radia">{s}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No standout strengths (all scores &lt; 85)</p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">⚠️ Weaknesses</h4>
            {weaknesses.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {weaknesses.map((w) => (
                  <span key={w} className="rounded-full border border-agent-anita/30 bg-agent-anita/10 px-2.5 py-0.5 text-xs text-agent-anita">{w}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No weak areas (all scores ≥ 75)</p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Summary</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {result.agent_name} ranked #{rank} with an overall score of {result.overall_score}.
              {strengths.length > 0 && ` Excels at ${strengths.join(", ")}.`}
              {weaknesses.length > 0 && ` Could improve in ${weaknesses.join(", ")}.`}
              {" "}Response time: {result.execution_time_ms}ms.
            </p>
          </div>
        </div>
      </div>

      {/* Response sample */}
      {result.raw_response && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Response Sample</h4>
          <div className="rounded-lg border border-border bg-muted/30 p-3 max-h-32 overflow-y-auto">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">{result.raw_response}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
