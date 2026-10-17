import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type ScoreRow = { name: string; score: number; created_at: string };

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sb: SupabaseClient | null = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

// In-memory fallback so the demo works with zero setup.
const scores: ScoreRow[] = [];
const events: Record<string, number> = {};

export const usingSupabase = Boolean(sb);

export async function topScores(limit = 10): Promise<ScoreRow[]> {
  if (sb) {
    const { data, error } = await sb.from("scores").select("name,score,created_at")
      .order("score", { ascending: false }).order("created_at", { ascending: true }).limit(limit);
    if (error) throw error;
    return data as ScoreRow[];
  }
  return [...scores].sort((a, b) => b.score - a.score || a.created_at.localeCompare(b.created_at)).slice(0, limit);
}

export async function addScore(name: string, score: number) {
  if (sb) {
    const { error } = await sb.from("scores").insert({ name, score });
    if (error) throw error;
    return;
  }
  scores.push({ name, score, created_at: new Date().toISOString() });
}

export async function addEvent(name: string) {
  if (sb) { await sb.from("events").insert({ name }); return; }
  events[name] = (events[name] || 0) + 1;
}

export async function funnel(names: string[]): Promise<Record<string, number>> {
  if (!sb) return Object.fromEntries(names.map((n) => [n, events[n] || 0]));
  const out: Record<string, number> = {};
  for (const n of names) {
    const { count } = await sb.from("events").select("*", { count: "exact", head: true }).eq("name", n);
    out[n] = count ?? 0;
  }
  return out;
}
