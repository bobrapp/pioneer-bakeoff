import { LayoutDashboard } from "lucide-react";

const Dashboard = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <LayoutDashboard className="h-7 w-7 text-primary" />
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        { label: "Agents Online", value: "6 / 6" },
        { label: "Bake-offs Run", value: "0" },
        { label: "Status", value: "Ready" },
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
    <p className="text-sm text-muted-foreground">Select "Run Bake-off" to start an evaluation.</p>
  </div>
);

export default Dashboard;
