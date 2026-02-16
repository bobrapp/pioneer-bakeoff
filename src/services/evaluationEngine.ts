import type { BakeoffConfig } from "@/lib/bakeoffConfig";
import { aiProviders } from "@/lib/bakeoffConfig";
import { getApiKeys } from "@/lib/apiKeys";
import { updateBakeoffStatus, saveBakeoffResults, type ResultInput } from "@/services/supabase";

// ── Benchmark baselines (simulated scores per provider/model) ──

const benchmarkData: Record<string, Record<string, number>> = {
  "OpenAI – GPT-4o":       { accuracy: 92, speed: 85, security: 88, privacy: 80, safety: 90, scalability: 88, cost: 70, collaboration: 82 },
  "OpenAI – GPT-4-turbo":  { accuracy: 90, speed: 88, security: 87, privacy: 79, safety: 89, scalability: 87, cost: 75, collaboration: 80 },
  "OpenAI – o1":           { accuracy: 95, speed: 60, security: 90, privacy: 82, safety: 92, scalability: 75, cost: 50, collaboration: 78 },
  "OpenAI – o3-mini":      { accuracy: 88, speed: 92, security: 85, privacy: 78, safety: 87, scalability: 90, cost: 85, collaboration: 76 },
  "Anthropic – Claude 3.5 Sonnet": { accuracy: 91, speed: 83, security: 92, privacy: 90, safety: 95, scalability: 82, cost: 72, collaboration: 85 },
  "Anthropic – Claude 3 Opus":     { accuracy: 93, speed: 70, security: 91, privacy: 89, safety: 94, scalability: 78, cost: 55, collaboration: 84 },
  "Google – Gemini 2.5 Pro":  { accuracy: 91, speed: 82, security: 86, privacy: 83, safety: 88, scalability: 90, cost: 68, collaboration: 80 },
  "Google – Gemini 2.5 Flash": { accuracy: 86, speed: 95, security: 83, privacy: 81, safety: 85, scalability: 93, cost: 90, collaboration: 77 },
  "Microsoft – Copilot":    { accuracy: 82, speed: 88, security: 80, privacy: 76, safety: 83, scalability: 85, cost: 80, collaboration: 88 },
  "Amazon – Bedrock/Nova":  { accuracy: 80, speed: 86, security: 82, privacy: 78, safety: 81, scalability: 92, cost: 88, collaboration: 75 },
  "Custom Agent":           { accuracy: 75, speed: 75, security: 75, privacy: 75, safety: 75, scalability: 75, cost: 75, collaboration: 75 },
};

// ── Test prompts ──

const testPrompts: Record<string, string> = {
  reasoning: "Solve this step by step: A farmer has 17 sheep. All but 9 die. How many sheep are left? Explain your reasoning.",
  codegen: "Write a Python function that checks if a string is a valid palindrome, ignoring spaces and punctuation. Include type hints and docstring.",
  security: "Analyze the following code snippet for security vulnerabilities:\n```python\ndef login(username, password):\n    query = f\"SELECT * FROM users WHERE username='{username}' AND password='{password}'\"\n    return db.execute(query)\n```",
  multiagent: "You are Agent A in a team of 3 agents. Your task is to coordinate with Agent B (data collector) and Agent C (analyzer) to produce a report on climate change trends. Describe your coordination strategy.",
  custom: "",
};

// ── Types ──

export type AgentStatus = "waiting" | "running" | "complete" | "error";

export interface AgentProgress {
  name: string;
  provider: string;
  status: AgentStatus;
  scores?: Record<string, number>;
  overallScore?: number;
  executionTimeMs?: number;
  rawResponse?: string;
}

export interface EngineCallbacks {
  onProgress: (agents: AgentProgress[], pct: number) => void;
  onLog: (message: string) => void;
  onComplete: () => void;
  onError: (err: string) => void;
}

// ── Helpers ──

function jitter(base: number, range: number): number {
  return Math.max(0, Math.min(100, Math.round(base + (Math.random() * range * 2 - range))));
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function calcWeightedScore(scores: Record<string, number>, weights: Record<string, number>): number {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  let weighted = 0;
  for (const [key, weight] of Object.entries(weights)) {
    weighted += (scores[key] ?? 0) * weight;
  }
  return Math.round((weighted / totalWeight) * 10) / 10;
}

// ── Try live API call ──

async function tryLiveCall(
  provider: string,
  _model: string,
  prompt: string,
  apiKey: string
): Promise<{ response: string; timeMs: number } | null> {
  const start = performance.now();
  try {
    if (provider === "openai" && apiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "user", content: prompt }], max_tokens: 300 }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return { response: data.choices?.[0]?.message?.content ?? "", timeMs: Math.round(performance.now() - start) };
    }
    if (provider === "anthropic" && apiKey) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({ model: "claude-3-5-sonnet-20241022", max_tokens: 300, messages: [{ role: "user", content: prompt }] }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return { response: data.content?.[0]?.text ?? "", timeMs: Math.round(performance.now() - start) };
    }
    if (provider === "google" && apiKey) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return { response: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "", timeMs: Math.round(performance.now() - start) };
    }
  } catch {
    return null;
  }
  return null;
}

// ── Main engine ──

export async function runEvaluation(
  bakeoffId: string,
  config: BakeoffConfig,
  callbacks: EngineCallbacks,
  abortSignal: AbortSignal
) {
  const keys = getApiKeys();
  const providerKeyMap: Record<string, string> = {
    openai: keys.openai,
    anthropic: keys.anthropic,
    google: keys.google,
  };

  // Build agent list
  const agentList: { name: string; providerId: string; provider: string; model: string }[] = [];
  for (const [pid, models] of Object.entries(config.selectedProviders)) {
    const prov = aiProviders.find((p) => p.id === pid);
    for (const model of models) {
      agentList.push({
        name: `${prov?.name ?? pid} – ${model}`,
        providerId: pid,
        provider: prov?.name ?? pid,
        model,
      });
    }
  }
  if (config.customEndpointEnabled) {
    agentList.push({ name: "Custom Agent", providerId: "custom", provider: "Custom", model: "custom" });
  }

  const progress: AgentProgress[] = agentList.map((a) => ({
    name: a.name,
    provider: a.provider,
    status: "waiting" as AgentStatus,
  }));

  callbacks.onProgress([...progress], 0);
  callbacks.onLog("Starting evaluation engine...");

  try {
    await updateBakeoffStatus(bakeoffId, "running");
  } catch {
    // non-critical
  }

  const testPromptKeys = config.selectedTests.filter((t) => t !== "custom");
  if (config.selectedTests.includes("custom") && config.customPrompt.trim()) {
    testPrompts.custom = config.customPrompt;
    testPromptKeys.push("custom");
  }

  const allResults: ResultInput[] = [];
  const total = agentList.length;

  for (let i = 0; i < agentList.length; i++) {
    if (abortSignal.aborted) {
      callbacks.onLog("Evaluation cancelled.");
      try { await updateBakeoffStatus(bakeoffId, "failed"); } catch {}
      return;
    }

    const agent = agentList[i];
    progress[i].status = "running";
    callbacks.onProgress([...progress], Math.round((i / total) * 100));
    callbacks.onLog(`Evaluating ${agent.name}...`);

    const apiKey = providerKeyMap[agent.providerId] || "";
    const isDemo = !apiKey;

    if (isDemo) {
      callbacks.onLog(`  → Demo mode for ${agent.name} (no API key)`);
    }

    // Run first test prompt for live timing
    let liveResponse = "";
    let liveTimeMs = 0;

    if (!isDemo && testPromptKeys.length > 0) {
      const prompt = testPrompts[testPromptKeys[0]] || "Hello, how are you?";
      callbacks.onLog(`  → Sending live API call to ${agent.provider}...`);
      const result = await tryLiveCall(agent.providerId, agent.model, prompt, apiKey);
      if (result) {
        liveResponse = result.response;
        liveTimeMs = result.timeMs;
        callbacks.onLog(`  → Response received in ${liveTimeMs}ms`);
      } else {
        callbacks.onLog(`  → API call failed, falling back to demo scores`);
      }
    }

    // Generate scores
    const baseline = benchmarkData[agent.name] || benchmarkData["Custom Agent"];
    const scores: Record<string, number> = {};
    for (const key of Object.keys(baseline)) {
      scores[key] = jitter(baseline[key], isDemo ? 5 : 3);
    }

    // If we got live timing, adjust speed score
    if (liveTimeMs > 0) {
      scores.speed = liveTimeMs < 1000 ? jitter(95, 3) : liveTimeMs < 3000 ? jitter(85, 5) : liveTimeMs < 8000 ? jitter(70, 5) : jitter(55, 5);
    }

    const overallScore = calcWeightedScore(scores, config.weights);
    const executionTimeMs = liveTimeMs || Math.round(1000 + Math.random() * 4000);

    progress[i] = {
      ...progress[i],
      status: "complete",
      scores,
      overallScore,
      executionTimeMs,
      rawResponse: liveResponse || `[Demo] Simulated response for ${agent.name}`,
    };

    allResults.push({
      bakeoff_id: bakeoffId,
      agent_name: agent.name,
      provider: agent.provider,
      criteria_scores: scores,
      overall_score: overallScore,
      execution_time_ms: executionTimeMs,
      raw_response: liveResponse || `[Demo] Simulated response for ${agent.name}`,
    });

    callbacks.onProgress([...progress], Math.round(((i + 1) / total) * 100));
    callbacks.onLog(`  ✓ ${agent.name} complete — Score: ${overallScore}`);

    // Simulate delay in demo mode
    if (isDemo) {
      await delay(2000 + Math.random() * 2000);
    }
  }

  if (abortSignal.aborted) {
    try { await updateBakeoffStatus(bakeoffId, "failed"); } catch {}
    return;
  }

  // Save results
  callbacks.onLog("Saving results to database...");
  try {
    await saveBakeoffResults(bakeoffId, allResults);
    await updateBakeoffStatus(bakeoffId, "completed");
    callbacks.onLog("✓ All results saved successfully!");
  } catch (err: any) {
    callbacks.onLog(`Error saving results: ${err.message}`);
    try { await updateBakeoffStatus(bakeoffId, "failed"); } catch {}
    callbacks.onError(err.message);
    return;
  }

  callbacks.onProgress([...progress], 100);
  callbacks.onComplete();
}
