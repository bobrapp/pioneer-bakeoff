import { Download, FileJson, Printer, Link2 } from "lucide-react";
import { exportCSV, exportJSON, type ResultRow } from "@/lib/resultsHelpers";
import { toast } from "sonner";
import { useAnalytics } from "@/hooks/useAnalytics";

interface Props {
  results: ResultRow[];
  bakeoffId: string;
}

export function ExportBar({ results, bakeoffId }: Props) {
  const { track } = useAnalytics();
  const handleCopyLink = () => {
    const url = `${window.location.origin}/results?bakeoff=${bakeoffId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handlePrint = () => window.print();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => { exportCSV(results); track("results_exported", { format: "csv", bakeoff_id: bakeoffId }); }}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        CSV
      </button>
      <button
        onClick={() => { exportJSON(results); track("results_exported", { format: "json", bakeoff_id: bakeoffId }); }}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <FileJson className="h-3.5 w-3.5" />
        JSON
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Printer className="h-3.5 w-3.5" />
        Print
      </button>
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Link2 className="h-3.5 w-3.5" />
        Share Link
      </button>
    </div>
  );
}
