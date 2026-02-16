import { Link, useLocation } from "react-router-dom";
import { Bot, FlaskConical, LayoutDashboard, BarChart3, GitBranch } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Agent Gallery", path: "/", icon: Bot },
  { label: "Run Bake-off", path: "/run", icon: FlaskConical },
  { label: "Results", path: "/results", icon: BarChart3 },
  { label: "Pipeline", path: "/pipeline", icon: GitBranch },
];

export function AppHeader() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">
              AI Agent Bake-off
            </h1>
            <p className="text-xs text-muted-foreground">Honoring Pioneers. Evaluating AI.</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
