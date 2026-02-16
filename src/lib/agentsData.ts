import { type AgentKey } from "@/lib/agents";

export interface AgentData {
  key: AgentKey;
  name: string;
  namesake: string;
  title: string;
  description: string;
  focus: string[];
  wikiUrl: string;
}

export const agents: AgentData[] = [
  {
    key: "ada",
    name: "Ada",
    namesake: "Ada Lovelace",
    title: "Discovery",
    description: "First computer programmer. Pioneered algorithmic thinking and envisioned machines beyond mere calculation.",
    focus: ["Algorithmic Accuracy", "Performance Benchmarking", "Discovery Engine"],
    wikiUrl: "https://en.wikipedia.org/wiki/Ada_Lovelace",
  },
  {
    key: "grace",
    name: "Grace",
    namesake: "Grace Hopper",
    title: "Parsing & Synthesis",
    description: "Programming language pioneer who invented the first compiler and championed machine-independent languages.",
    focus: ["Language Integration", "Compatibility Testing", "Syntax Parsing"],
    wikiUrl: "https://en.wikipedia.org/wiki/Grace_Hopper",
  },
  {
    key: "hedy",
    name: "Hedy",
    namesake: "Hedy Lamarr",
    title: "Security & Privacy",
    description: "Invented frequency-hopping spread spectrum, the foundation of secure wireless communications.",
    focus: ["Encryption Analysis", "Privacy Compliance", "Threat Detection"],
    wikiUrl: "https://en.wikipedia.org/wiki/Hedy_Lamarr",
  },
  {
    key: "radia",
    name: "Radia",
    namesake: "Radia Perlman",
    title: "Network Efficiency",
    description: "Mother of the Internet. Invented the Spanning Tree Protocol enabling scalable network architecture.",
    focus: ["Speed Optimization", "Scalability Testing", "Network Analysis"],
    wikiUrl: "https://en.wikipedia.org/wiki/Radia_Perlman",
  },
  {
    key: "anita",
    name: "Anita",
    namesake: "Anita Borg",
    title: "Coordination",
    description: "Collaboration advocate who championed diversity in tech and founded the Institute for Women and Technology.",
    focus: ["Multi-Agent Swarm", "Coordination Testing", "Team Dynamics"],
    wikiUrl: "https://en.wikipedia.org/wiki/Anita_Borg",
  },
  {
    key: "margaret",
    name: "Margaret",
    namesake: "Margaret Hamilton",
    title: "Orchestration",
    description: "NASA software lead who coined 'software engineering' and built Apollo's fault-tolerant flight systems.",
    focus: ["Central Orchestration", "Evaluation Pipeline", "Fault Tolerance"],
    wikiUrl: "https://en.wikipedia.org/wiki/Margaret_Hamilton_(software_engineer)",
  },
];
