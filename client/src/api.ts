export type Score = { name: string; score: number };

export async function getTop(): Promise<Score[]> {
  const r = await fetch("/api/score");
  const d = await r.json();
  return d.top ?? [];
}

export async function saveScore(name: string, score: number) {
  await fetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, score }),
  });
}

// Funnel tracking for the demo: started -> finished -> shared -> cta_click
export function track(name: "started" | "finished" | "shared" | "cta_click") {
  try {
    navigator.sendBeacon?.("/api/event", new Blob([JSON.stringify({ name })], { type: "application/json" }));
  } catch {}
}
