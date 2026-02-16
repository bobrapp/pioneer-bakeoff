import { BarChart3 } from "lucide-react";

const Results = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <BarChart3 className="h-7 w-7 text-primary" />
      <h2 className="text-2xl font-bold text-foreground">Results</h2>
    </div>
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
      <p className="text-muted-foreground">Bake-off results and agent comparison metrics will appear here.</p>
      <p className="mt-2 text-xs text-muted-foreground/60">No results yet</p>
    </div>
  </div>
);

export default Results;
