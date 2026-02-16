import { Link, useLocation } from "react-router-dom";
import {
  Bot, FlaskConical, LayoutDashboard, BarChart3, GitBranch,
  ChevronLeft, ChevronRight, Circle,
} from "lucide-react";
import { useState } from "react";
import { agents } from "@/lib/agentsData";
import { agentColorMap } from "@/lib/agents";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Agent Gallery", path: "/", icon: Bot },
  { label: "Run Bake-off", path: "/run", icon: FlaskConical },
  { label: "Results", path: "/results", icon: BarChart3 },
  { label: "Pipeline", path: "/pipeline", icon: GitBranch },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-border bg-sidebar transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center justify-end p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {!collapsed && (
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </p>
        )}
        {navItems.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-border p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Agents
          </p>
          <div className="space-y-1.5">
            {agents.map((agent) => (
              <div key={agent.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Circle className={`h-2.5 w-2.5 fill-current ${agentColorMap[agent.key].text}`} />
                <span>{agent.name}</span>
                <span className="ml-auto text-[10px] opacity-60">Ready</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
