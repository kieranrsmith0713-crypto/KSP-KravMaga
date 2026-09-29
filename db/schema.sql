-- KSP Krav Maga — initial schema.
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query),
-- or via the Supabase CLI. It creates the class log, technique, and grading
-- tables and locks them down with Row Level Security so each user only sees
-- their own rows.
--
-- This app shares the Supabase project used by KSP Hub and the rest of the
-- Hub apps — do not point it at a separate project. Tables are prefixed
-- `krav_` because that project is shared: generic names like `classes` or
-- `sessions` would be too easy to collide with another app. Access to this
-- app is gated by the Hub's existing `user_app_access` table
-- (appId "krav-maga"), which is owned by KSP Hub and not created here.

-- ---------- Classes: one row per class attended ----------
create table if not exists public.krav_classes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  class_date       date not null default current_date,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  class_type       text not null default 'Regular',
  -- How hard the class felt, 1 (easy) to 5 (brutal). Optional.
  intensity        smallint check (intensity between 1 and 5),
  notes            text not null default '',
  created_at       timestamptz not null default now()
);

create index if not exists krav_classes_user_date_idx
  on public.krav_classes (user_id, class_date desc);

alter table public.krav_classes enable row level security;

drop policy if exists "Users can read own krav_classes" on public.krav_classes;
create policy "Users can read own krav_classes"
  on public.krav_classes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own krav_classes" on public.krav_classes;
create policy "Users can insert own krav_classes"
  on public.krav_classes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own krav_classes" on public.krav_classes;
create policy "Users can update own krav_classes"
  on public.krav_classes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own krav_classes" on public.krav_classes;
create policy "Users can delete own krav_classes"
  on public.krav_classes for delete
  using (auth.uid() = user_id);

-- ---------- Techniques: the curriculum, and how well you know each ----------
create table if not exists public.krav_techniques (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  category    text not null default 'Other',
  -- The grade the technique belongs to in your syllabus (e.g. "P1", "Yellow").
  -- Free text since syllabuses differ between federations.
  level       text not null default '',
  -- Self-assessed, 1 (just introduced) to 5 (second nature).
  proficiency smallint not null default 1 check (proficiency between 1 and 5),
  notes       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists krav_techniques_user_name_idx
  on public.krav_techniques (user_id, name);

alter table public.krav_techniques enable row level security;

drop policy if exists "Users can read own krav_techniques" on public.krav_techniques;
create policy "Users can read own krav_techniques"
  on public.krav_techniques for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own krav_techniques" on public.krav_techniques;
create policy "Users can insert own krav_techniques"
  on public.krav_techniques for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own krav_techniques" on public.krav_techniques;
create policy "Users can update own krav_techniques"
  on public.krav_techniques for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own krav_techniques" on public.krav_techniques;
create policy "Users can delete own krav_techniques"
  on public.krav_techniques for delete
  using (auth.uid() = user_id);

-- ---------- Gradings: past results and upcoming dates ----------
create table if not exists public.krav_gradings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  grading_date date not null,
  level        text not null,
  -- null = not taken yet (upcoming), true = passed, false = didn't pass.
  passed       boolean,
  notes        text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists krav_gradings_user_date_idx
  on public.krav_gradings (user_id, grading_date desc);

alter table public.krav_gradings enable row level security;

drop policy if exists "Users can read own krav_gradings" on public.krav_gradings;
create policy "Users can read own krav_gradings"
  on public.krav_gradings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own krav_gradings" on public.krav_gradings;
create policy "Users can insert own krav_gradings"
  on public.krav_gradings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own krav_gradings" on public.krav_gradings;
create policy "Users can update own krav_gradings"
  on public.krav_gradings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own krav_gradings" on public.krav_gradings;
create policy "Users can delete own krav_gradings"
  on public.krav_gradings for delete
  using (auth.uid() = user_id);
