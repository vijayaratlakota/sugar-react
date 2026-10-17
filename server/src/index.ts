import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addEvent, addScore, funnel, topScores, usingSupabase } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json({ type: ["application/json", "text/plain"] }));

const EVENTS = ["started", "finished", "shared", "cta_click"];

app.get("/api/health", (_req, res) => res.json({ ok: true, db: usingSupabase ? "supabase" : "memory" }));

// Leaderboard
app.get("/api/score", async (_req, res) => {
  try { res.json({ top: await topScores(10) }); }
  catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post("/api/score", async (req, res) => {
  const name = String(req.body?.name ?? "").trim().slice(0, 24);
  const score = Number(req.body?.score);
  if (!name || !Number.isFinite(score) || score < 0 || score > 100) return res.status(400).json({ error: "invalid" });
  try { await addScore(name, score); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: String(e) }); }
});

// Funnel: POST from the app, GET /api/event during the demo to show judges the numbers
app.post("/api/event", async (req, res) => {
  const name = String(req.body?.name ?? "");
  if (!EVENTS.includes(name)) return res.status(400).json({ error: "invalid" });
  await addEvent(name).catch(() => {});
  res.json({ ok: true });
});
app.get("/api/event", async (_req, res) => res.json(await funnel(EVENTS)));

// Serve the built React app (client/dist) so it's one deploy
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(dist));
app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`API on http://localhost:${port} (db: ${usingSupabase ? "supabase" : "memory"})`));
