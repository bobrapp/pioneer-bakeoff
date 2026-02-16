import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { BakeoffConfig } from "@/lib/bakeoffConfig";

// ── Bakeoffs ──

export async function createBakeoff(config: BakeoffConfig, name?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("bakeoffs")
    .insert({
      name: name || "Bake-off " + new Date().toLocaleDateString(),
      configuration: config as unknown as Json,
      user_id: user.id,
      status: "pending" as const,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBakeoffs() {
  const { data, error } = await supabase
    .from("bakeoffs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateBakeoffStatus(
  id: string,
  status: "pending" | "running" | "completed" | "failed"
) {
  const { error } = await supabase
    .from("bakeoffs")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

// ── Results ──

export interface ResultInput {
  bakeoff_id: string;
  agent_name: string;
  provider: string;
  criteria_scores: Record<string, number>;
  overall_score: number;
  execution_time_ms: number;
  raw_response?: string;
}

export async function saveBakeoffResults(bakeoffId: string, results: ResultInput[]) {
  const rows = results.map((r) => ({
    ...r,
    bakeoff_id: bakeoffId,
    criteria_scores: r.criteria_scores as unknown as Json,
  }));

  const { data, error } = await supabase
    .from("results")
    .insert(rows)
    .select();

  if (error) throw error;
  return data;
}

export async function getResults(bakeoffId: string) {
  const { data, error } = await supabase
    .from("results")
    .select("*")
    .eq("bakeoff_id", bakeoffId)
    .order("overall_score", { ascending: false });

  if (error) throw error;
  return data;
}

// ── Agents ──

export async function listAgents() {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
}
