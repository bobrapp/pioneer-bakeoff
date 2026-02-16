export interface AIProvider {
  id: string;
  name: string;
  models: string[];
  icon: string; // lucide icon name concept - we'll use initials
  color: string; // tailwind text color class
}

export const aiProviders: AIProvider[] = [
  { id: "openai", name: "OpenAI", models: ["GPT-4o", "GPT-4-turbo", "o1", "o3-mini"], icon: "O", color: "text-emerald-400" },
  { id: "anthropic", name: "Anthropic", models: ["Claude 3.5 Sonnet", "Claude 3 Opus"], icon: "A", color: "text-orange-400" },
  { id: "google", name: "Google", models: ["Gemini 2.5 Pro", "Gemini 2.5 Flash"], icon: "G", color: "text-blue-400" },
  { id: "microsoft", name: "Microsoft", models: ["Copilot"], icon: "M", color: "text-cyan-400" },
  { id: "amazon", name: "Amazon", models: ["Bedrock/Nova"], icon: "A", color: "text-yellow-400" },
];

export interface EvalCriterion {
  id: string;
  label: string;
  description: string;
}

export const evalCriteria: EvalCriterion[] = [
  { id: "accuracy", label: "Accuracy", description: "Correctness of outputs" },
  { id: "speed", label: "Speed", description: "Response latency" },
  { id: "security", label: "Security", description: "Resistance to attacks" },
  { id: "privacy", label: "Privacy", description: "Data handling practices" },
  { id: "safety", label: "Safety", description: "Content safety guardrails" },
  { id: "scalability", label: "Scalability", description: "Performance under load" },
  { id: "cost", label: "Cost Efficiency", description: "Output quality per dollar" },
  { id: "collaboration", label: "Collaborative Capability", description: "Multi-agent coordination" },
];

export interface TestType {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export const testTypes: TestType[] = [
  { id: "reasoning", label: "Standardized Reasoning Benchmark", description: "MMLU, HellaSwag, ARC and more", icon: "brain" },
  { id: "codegen", label: "Code Generation Task", description: "HumanEval, MBPP style challenges", icon: "code" },
  { id: "security", label: "Security Vulnerability Detection", description: "OWASP, CVE pattern recognition", icon: "shield" },
  { id: "multiagent", label: "Multi-Agent Collaboration Scenario", description: "Swarm coordination tasks", icon: "users" },
  { id: "custom", label: "Custom Prompt Test", description: "Define your own evaluation prompt", icon: "pencil" },
];

export type Complexity = "basic" | "standard" | "advanced";

export interface BakeoffConfig {
  selectedProviders: Record<string, string[]>; // providerId -> selected model names
  customEndpoint: string;
  customEndpointEnabled: boolean;
  weights: Record<string, number>;
  selectedTests: string[];
  complexity: Complexity;
  customPrompt: string;
}

export const defaultConfig: BakeoffConfig = {
  selectedProviders: {},
  customEndpoint: "",
  customEndpointEnabled: false,
  weights: Object.fromEntries(evalCriteria.map((c) => [c.id, Math.round(100 / evalCriteria.length)])),
  selectedTests: [],
  complexity: "standard",
  customPrompt: "",
};
