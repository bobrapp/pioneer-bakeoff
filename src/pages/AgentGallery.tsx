import { agents } from "@/lib/agentsData";
import { AgentCard } from "@/components/AgentCard";
import { Bot } from "lucide-react";

const AgentGallery = () => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <Bot className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Agent Gallery</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Six AI agents, each named after a pioneering woman in computer science.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard key={agent.key} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default AgentGallery;
