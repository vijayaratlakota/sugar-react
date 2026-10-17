# Guess the Sugar (Steer Club Hackathon starter)
React + TypeScript (Vite) frontend, Express + TypeScript backend.

Daily Wordle-style game: pick which Indian food spikes blood sugar more, 10 rounds,
same puzzle for everyone each day, Wrapped-style share image, leaderboard, funnel stats,
and a CTA to Steer's GLP-1 specialist call.

## Run locally
```bash
npm run install:all
npm run dev        # web: http://localhost:5173  api: http://localhost:4000
```
Vite proxies /api to Express, so the frontend just calls fetch("/api/...").

## Deploy as one app (Render, free)
1. Push to GitHub.
2. render.com -> New -> Web Service -> pick the repo.
3. Build command: `npm run install:all && npm run build`
4. Start command: `npm start`
Express serves the built React app and the API from the same URL.
(Railway works the same way.)

## Leaderboard that survives restarts (optional)
1. Free project on supabase.com -> SQL editor -> run `schema.sql`.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars on Render.
Without them, everything is in memory (fine for a demo).

## What's where
- `client/src/App.tsx` - the game: intro, 10 rounds, reveal, result, share, leaderboard, CTA
- `client/src/foods.ts` - 32 foods with GI values + sources (`verify: true` = double-check before demo)
- `client/src/shareCard.ts` - draws the share image on a canvas, shared via the phone's share sheet
- `client/src/api.ts` - fetch helpers + funnel tracking
- `server/src/index.ts` - Express routes: /api/score, /api/event, /api/health, serves the React build
- `server/src/db.ts` - Supabase or in-memory storage

## Demo tip
Open `/api/event` on screen: started -> finished -> shared -> cta_click counts.

## Ideas to add at the event
- Streaks in localStorage + "next puzzle in 6h" countdown
- A swap tip after each wrong answer (e.g. add dal to rice)
- Hindi/Telugu/Kannada toggle
- Personalised result line via an LLM, fixed wording, no medical advice

GI values: International Tables of Glycemic Index and Glycemic Load (Atkinson et al., Diabetes Care 2008, 2021 update)
plus Indian GI studies. Educational only, not medical advice.
