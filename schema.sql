-- Run in Supabase SQL editor
create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 24),
  score int not null check (score between 0 and 100),
  streak int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists scores_score_idx on scores (score desc, created_at asc);
-- Funnel events for the demo (started, finished, shared, cta_click)
create table if not exists events (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz not null default now()
);
