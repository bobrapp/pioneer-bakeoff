import type { Json } from "@/integrations/supabase/types";
import { evalCriteria } from "@/lib/bakeoffConfig";

export interface ResultRow {
  id: string;
  agent_name: string;
  provider: string;
  criteria_scores: Json;
  overall_score: number;
  execution_time_ms: number;
  raw_response: string | null;
  created_at: string;
  bakeoff_id: string;
}

export interface BakeoffRow {
  id: string;
  name: string;
  status: string;
  configuration: Json;
  created_at: string;
  user_id: string;
}

export function parseScores(scores: Json): Record<string, number> {
  if (scores && typeof scores === "object" && !Array.isArray(scores)) {
    return scores as Record<string, number>;
  }
  return {};
}

export function scoreColor(score: number): string {
  if (score > 80) return "text-agent-radia";
  if (score >= 50) return "text-agent-anita";
  return "text-destructive";
}

export function scoreBg(score: number): string {
  if (score > 80) return "bg-agent-radia/20";
  if (score >= 50) return "bg-agent-anita/20";
  return "bg-destructive/20";
}

export function rankBadge(rank: number): { label: string; className: string } {
  if (rank === 1) return { label: "🥇", className: "bg-agent-margaret/20 text-agent-margaret border-agent-margaret/30" };
  if (rank === 2) return { label: "🥈", className: "bg-muted text-muted-foreground border-border" };
  if (rank === 3) return { label: "🥉", className: "bg-agent-anita/20 text-agent-anita border-agent-anita/30" };
  return { label: `#${rank}`, className: "bg-muted text-muted-foreground border-border" };
}

export function getStrengths(scores: Record<string, number>): string[] {
  return Object.entries(scores)
    .filter(([, v]) => v >= 85)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([k]) => evalCriteria.find((c) => c.id === k)?.label ?? k);
}

export function getWeaknesses(scores: Record<string, number>): string[] {
  return Object.entries(scores)
    .filter(([, v]) => v < 75)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([k]) => evalCriteria.find((c) => c.id === k)?.label ?? k);
}

export function exportCSV(results: ResultRow[]) {
  const criteriaIds = evalCriteria.map((c) => c.id);
  const header = ["Agent", "Provider", "Overall Score", "Execution Time (ms)", ...evalCriteria.map((c) => c.label)];
  const rows = results.map((r) => {
    const scores = parseScores(r.criteria_scores);
    return [r.agent_name, r.provider, r.overall_score, r.execution_time_ms, ...criteriaIds.map((id) => scores[id] ?? "")];
  });
  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  downloadBlob(csv, "bakeoff-results.csv", "text/csv");
}

export function exportJSON(results: ResultRow[]) {
  const json = JSON.stringify(results.map((r) => ({ ...r, criteria_scores: parseScores(r.criteria_scores) })), null, 2);
  downloadBlob(json, "bakeoff-results.json", "application/json");
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
