export type AgentKey = "ada" | "grace" | "hedy" | "radia" | "anita" | "margaret";

export const agentColorMap: Record<AgentKey, { border: string; bg: string; text: string; glow: string; badge: string }> = {
  ada: {
    border: "border-agent-ada",
    bg: "bg-agent-ada/10",
    text: "text-agent-ada",
    glow: "card-glow-ada",
    badge: "bg-agent-ada/20 text-agent-ada border-agent-ada/30",
  },
  grace: {
    border: "border-agent-grace",
    bg: "bg-agent-grace/10",
    text: "text-agent-grace",
    glow: "card-glow-grace",
    badge: "bg-agent-grace/20 text-agent-grace border-agent-grace/30",
  },
  hedy: {
    border: "border-agent-hedy",
    bg: "bg-agent-hedy/10",
    text: "text-agent-hedy",
    glow: "card-glow-hedy",
    badge: "bg-agent-hedy/20 text-agent-hedy border-agent-hedy/30",
  },
  radia: {
    border: "border-agent-radia",
    bg: "bg-agent-radia/10",
    text: "text-agent-radia",
    glow: "card-glow-radia",
    badge: "bg-agent-radia/20 text-agent-radia border-agent-radia/30",
  },
  anita: {
    border: "border-agent-anita",
    bg: "bg-agent-anita/10",
    text: "text-agent-anita",
    glow: "card-glow-anita",
    badge: "bg-agent-anita/20 text-agent-anita border-agent-anita/30",
  },
  margaret: {
    border: "border-agent-margaret",
    bg: "bg-agent-margaret/10",
    text: "text-agent-margaret",
    glow: "card-glow-margaret",
    badge: "bg-agent-margaret/20 text-agent-margaret border-agent-margaret/30",
  },
};
