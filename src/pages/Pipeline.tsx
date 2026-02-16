import { GitBranch } from "lucide-react";

const Pipeline = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <GitBranch className="h-7 w-7 text-primary" />
      <h2 className="text-2xl font-bold text-foreground">Pipeline</h2>
    </div>
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
      <p className="text-muted-foreground">Visualize the agent evaluation pipeline and workflow stages.</p>
      <p className="mt-2 text-xs text-muted-foreground/60">Coming soon</p>
    </div>
  </div>
);

export default Pipeline;
