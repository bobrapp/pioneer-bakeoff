import { Link, useLocation } from "react-router-dom";
import { Bot, FlaskConical, LayoutDashboard, BarChart3, GitBranch, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Agent Gallery", path: "/", icon: Bot },
  { label: "Run Bake-off", path: "/run", icon: FlaskConical },
  { label: "Results", path: "/results", icon: BarChart3 },
  { label: "Pipeline", path: "/pipeline", icon: GitBranch },
  { label: "Settings", path: "/settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="md:hidden rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-background border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <FlaskConical className="h-5 w-5 text-primary" />
            AI Agent Bake-off
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
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
      </SheetContent>
    </Sheet>
  );
}
