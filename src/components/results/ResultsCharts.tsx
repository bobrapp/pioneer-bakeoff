import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
} from "recharts";
import { evalCriteria } from "@/lib/bakeoffConfig";
import { parseScores, type ResultRow, type BakeoffRow } from "@/lib/resultsHelpers";

const AGENT_COLORS = [
  "hsl(270,70%,65%)", "hsl(210,100%,60%)", "hsl(0,80%,60%)",
  "hsl(145,70%,50%)", "hsl(30,95%,60%)", "hsl(45,95%,55%)",
  "hsl(190,80%,55%)", "hsl(320,70%,60%)", "hsl(90,70%,50%)", "hsl(250,60%,70%)",
];

// ── Radar Chart ──

export function RadarComparisonChart({ results }: { results: ResultRow[] }) {
  const data = evalCriteria.map((c) => {
    const point: Record<string, string | number> = { criterion: c.label };
    results.forEach((r) => {
      point[r.agent_name] = parseScores(r.criteria_scores)[c.id] ?? 0;
    });
    return point;
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="text-sm font-semibold text-foreground mb-3">Radar Comparison</h4>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={data}>
          <PolarGrid stroke="hsl(222,30%,20%)" />
          <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(215,20%,55%)" }} />
          {results.map((r, i) => (
            <Radar
              key={r.id}
              name={r.agent_name}
              dataKey={r.agent_name}
              stroke={AGENT_COLORS[i % AGENT_COLORS.length]}
              fill={AGENT_COLORS[i % AGENT_COLORS.length]}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Overall Score Bar Chart ──

export function OverallBarChart({ results }: { results: ResultRow[] }) {
  const data = [...results]
    .sort((a, b) => b.overall_score - a.overall_score)
    .map((r, i) => ({
      name: r.agent_name,
      score: r.overall_score,
      fill: AGENT_COLORS[i % AGENT_COLORS.length],
    }));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="text-sm font-semibold text-foreground mb-3">Overall Weighted Scores</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,20%)" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(222,44%,12%)", border: "1px solid hsl(222,30%,20%)", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "hsl(210,40%,96%)" }}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Grouped Bar Chart per Criterion ──

export function GroupedCriteriaChart({ results }: { results: ResultRow[] }) {
  const data = evalCriteria.map((c) => {
    const point: Record<string, string | number> = { criterion: c.label };
    results.forEach((r) => {
      point[r.agent_name] = parseScores(r.criteria_scores)[c.id] ?? 0;
    });
    return point;
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="text-sm font-semibold text-foreground mb-3">Per-Criterion Comparison</h4>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,20%)" />
          <XAxis dataKey="criterion" tick={{ fontSize: 9, fill: "hsl(215,20%,55%)" }} angle={-30} textAnchor="end" height={60} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(222,44%,12%)", border: "1px solid hsl(222,30%,20%)", borderRadius: 8, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {results.map((r, i) => (
            <Bar key={r.id} dataKey={r.agent_name} fill={AGENT_COLORS[i % AGENT_COLORS.length]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Historical Line Chart ──

interface HistoryPoint {
  bakeoffName: string;
  date: string;
  [agentName: string]: string | number;
}

export function HistoricalChart({ bakeoffs, allResults }: { bakeoffs: BakeoffRow[]; allResults: Map<string, ResultRow[]> }) {
  const completed = bakeoffs.filter((b) => b.status === "completed").slice(0, 10).reverse();
  if (completed.length < 2) return null;

  // Collect all unique agent names
  const agentNames = new Set<string>();
  completed.forEach((b) => {
    allResults.get(b.id)?.forEach((r) => agentNames.add(r.agent_name));
  });

  const data: HistoryPoint[] = completed.map((b) => {
    const point: HistoryPoint = {
      bakeoffName: b.name,
      date: new Date(b.created_at).toLocaleDateString(),
    };
    const res = allResults.get(b.id) || [];
    res.forEach((r) => { point[r.agent_name] = r.overall_score; });
    return point;
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="text-sm font-semibold text-foreground mb-3">Historical Performance</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,20%)" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} />
          <Tooltip contentStyle={{ backgroundColor: "hsl(222,44%,12%)", border: "1px solid hsl(222,30%,20%)", borderRadius: 8, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {Array.from(agentNames).map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={AGENT_COLORS[i % AGENT_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
