import { agents } from "@/lib/agentsData";

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background/50 px-6 py-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Honoring{" "}
          {agents.map((agent, i) => (
            <span key={agent.key}>
              <a
                href={agent.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/80 underline decoration-border underline-offset-2 hover:text-primary transition-colors"
              >
                {agent.namesake}
              </a>
              {i < agents.length - 2 ? ", " : i === agents.length - 2 ? " & " : ""}
            </span>
          ))}
        </p>
        <p className="mt-2 text-xs text-muted-foreground/60">
          AI Agent Bake-off © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
