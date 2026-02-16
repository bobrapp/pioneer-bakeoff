import { Link, useLocation } from "react-router-dom";
import { Bot, FlaskConical, LayoutDashboard, BarChart3, GitBranch, LogOut } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Agent Gallery", path: "/", icon: Bot },
  { label: "Run Bake-off", path: "/run", icon: FlaskConical },
  { label: "Results", path: "/results", icon: BarChart3 },
  { label: "Pipeline", path: "/pipeline", icon: GitBranch },
];

interface AppHeaderProps {
  onSignOut?: () => void;
  userEmail?: string;
}

export function AppHeader({ onSignOut, userEmail }: AppHeaderProps) {
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

        {userEmail && (
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-muted-foreground truncate max-w-[140px]">{userEmail}</span>
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
