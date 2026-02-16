import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart3, Loader2 } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { getBakeoffs, getResults } from "@/services/supabase";
import type { ResultRow, BakeoffRow } from "@/lib/resultsHelpers";
import { WinnerBanner } from "@/components/results/WinnerBanner";
import { SummaryCards } from "@/components/results/SummaryCards";
import { ComparisonTable } from "@/components/results/ComparisonTable";
import { RadarComparisonChart, OverallBarChart, GroupedCriteriaChart, HistoricalChart } from "@/components/results/ResultsCharts";
import { ExportBar } from "@/components/results/ExportBar";
import { HistoricalList } from "@/components/results/HistoricalList";

type Tab = "results" | "history";

const Results = () => {
  const { trackPageView } = useAnalytics();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>("results");
  const [bakeoffs, setBakeoffs] = useState<BakeoffRow[]>([]);
  const [allResults, setAllResults] = useState<Map<string, ResultRow[]>>(new Map());
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("bakeoff"));
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { trackPageView("results"); }, [trackPageView]);

  // Load all bakeoffs
  useEffect(() => {
    (async () => {
      try {
        const bos = await getBakeoffs();
        setBakeoffs(bos as BakeoffRow[]);

        // Load results for all completed bakeoffs
        const map = new Map<string, ResultRow[]>();
        const completed = (bos as BakeoffRow[]).filter((b) => b.status === "completed");
        await Promise.all(
          completed.map(async (b) => {
            const res = await getResults(b.id);
            map.set(b.id, res as ResultRow[]);
          })
        );
        setAllResults(map);

        // Auto-select latest completed if none specified
        const paramId = searchParams.get("bakeoff");
        if (paramId && map.has(paramId)) {
          setSelectedId(paramId);
          setResults(map.get(paramId) || []);
        } else if (completed.length > 0) {
          const latestId = completed[0].id;
          setSelectedId(latestId);
          setResults(map.get(latestId) || []);
        }
      } catch (err) {
        console.error("Failed to load results", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  const handleSelectBakeoff = (id: string) => {
    setSelectedId(id);
    setResults(allResults.get(id) || []);
    setSearchParams({ bakeoff: id });
    setTab("results");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const winner = results.length > 0 ? [...results].sort((a, b) => b.overall_score - a.overall_score)[0] : null;
  const selectedBakeoff = bakeoffs.find((b) => b.id === selectedId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Results</h2>
            {selectedBakeoff && (
              <p className="text-xs text-muted-foreground">{selectedBakeoff.name} · {new Date(selectedBakeoff.created_at).toLocaleDateString()}</p>
            )}
          </div>
        </div>
        {results.length > 0 && selectedId && <ExportBar results={results} bakeoffId={selectedId} />}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["results", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "results" ? "Results" : "History"}
          </button>
        ))}
      </div>

      {tab === "history" && (
        <div className="animate-fade-in">
          <HistoricalList bakeoffs={bakeoffs} allResults={allResults} onSelect={handleSelectBakeoff} selectedId={selectedId} />
        </div>
      )}

      {tab === "results" && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-muted-foreground">No results to display.</p>
          <p className="mt-2 text-xs text-muted-foreground/60">Run a bake-off first, or select one from the History tab.</p>
        </div>
      )}

      {tab === "results" && results.length > 0 && (
        <div className="space-y-8 animate-fade-in">
          {/* Winner banner */}
          {winner && <WinnerBanner agentName={winner.agent_name} score={winner.overall_score} />}

          {/* Summary cards */}
          <SummaryCards results={results} />

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RadarComparisonChart results={results} />
            <OverallBarChart results={results} />
          </div>

          <GroupedCriteriaChart results={results} />

          {/* Historical chart if multiple bakeoffs */}
          <HistoricalChart bakeoffs={bakeoffs} allResults={allResults} />

          {/* Comparison table */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Detailed Comparison</h3>
            <p className="text-xs text-muted-foreground mb-4">Click column headers to sort. Click a row to expand agent details.</p>
            <ComparisonTable results={results} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
