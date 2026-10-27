-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

-- Private storage bucket for uploaded PDFs (accessed only via the
-- service-role client from the server, never directly by the browser).
insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false)
on conflict (id) do nothing;

-- Dictionary/grammar lookup cache (shared across all users)
create table if not exists dictionary_cache (
  word text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Texts (imported PDFs, generated beginner material, pasted text)
create table if not exists texts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade, -- null = shared/library text
  title text not null,
  source text not null check (source in ('pdf', 'generated', 'pasted')),
  content text not null,
  level text,
  created_at timestamptz not null default now()
);

-- Highlights + personal notes on a text, per user
create table if not exists highlights (
  id uuid primary key default gen_random_uuid(),
  text_id uuid not null references texts(id) on delete cascade,
  profile_id uuid not null references auth.users(id) on delete cascade,
  start_offset int not null,
  end_offset int not null,
  selected_text text not null,
  note text,
  created_at timestamptz not null default now()
);

-- Vocabulary items being tracked for spaced repetition, per user
create table if not exists vocab_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  word text not null,
  srs_state jsonb not null default '{}'::jsonb,
  due_at timestamptz not null default now(),
  source_text_id uuid references texts(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (profile_id, word)
);

-- Links each vocab item to its cached dictionary/grammar entry (enables
-- Supabase's nested-select join: vocab_items -> dictionary_cache). Words are
-- only ever added to vocab via the lookup flow, so the cache entry always
-- exists by the time this runs.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'vocab_items_word_fkey'
  ) then
    alter table vocab_items
      add constraint vocab_items_word_fkey foreign key (word) references dictionary_cache(word);
  end if;
end $$;

-- Grammar lesson read/progress tracking, per user
create table if not exists lesson_progress (
  profile_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  status text not null default 'unread' check (status in ('unread', 'in_progress', 'read')),
  updated_at timestamptz not null default now(),
  primary key (profile_id, lesson_id)
);

-- Row Level Security: every user only sees/writes their own rows.
-- dictionary_cache and library texts (owner_id is null) are shared/readable by everyone.

alter table texts enable row level security;
alter table highlights enable row level security;
alter table vocab_items enable row level security;
alter table lesson_progress enable row level security;
alter table dictionary_cache enable row level security;

drop policy if exists "texts readable by owner or shared" on texts;
create policy "texts readable by owner or shared" on texts
  for select using (owner_id is null or owner_id = auth.uid());

drop policy if exists "texts insertable by owner" on texts;
create policy "texts insertable by owner" on texts
  for insert with check (owner_id = auth.uid());

drop policy if exists "texts updatable by owner" on texts;
create policy "texts updatable by owner" on texts
  for update using (owner_id = auth.uid());

drop policy if exists "highlights scoped to profile" on highlights;
create policy "highlights scoped to profile" on highlights
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists "vocab scoped to profile" on vocab_items;
create policy "vocab scoped to profile" on vocab_items
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists "lesson progress scoped to profile" on lesson_progress;
create policy "lesson progress scoped to profile" on lesson_progress
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists "dictionary cache readable by anyone" on dictionary_cache;
create policy "dictionary cache readable by anyone" on dictionary_cache
  for select using (true);

drop policy if exists "dictionary cache writable by anyone authenticated" on dictionary_cache;
drop policy if exists "dictionary cache writable by anyone" on dictionary_cache;
create policy "dictionary cache writable by anyone" on dictionary_cache
  for insert with check (true); -- non-sensitive shared cache; same data for every user/guest

-- Force PostgREST to pick up schema changes (new tables/constraints) right
-- away, instead of waiting for its own cache to refresh on its own schedule.
notify pgrst, 'reload schema';
