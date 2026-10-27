# Build Plan — Swedish Learning App

Based on [design.md](./design.md). Stack: Next.js (App Router) on Vercel,
Supabase (Postgres + Storage + Auth).

## Phase 0 — Project setup
- `npx create-next-app@latest` (TypeScript, App Router, Tailwind).
- Create Supabase project (or reuse existing account); add `.env.local`
  with Supabase URL/keys and the Claude API key. Add `.env.local` to
  `.gitignore`.
- Install: `@supabase/supabase-js`, `@supabase/ssr`, `@anthropic-ai/sdk`,
  a PDF text-extraction lib (`pdf-parse` or `pdfjs-dist`).
- Set up Supabase Auth with Google OAuth provider (per design: accounts +
  guest mode). Wire a basic signed-in/guest shell layout.

## Phase 1 — Spike: word lookup quality (validate before building on it)
- One API route: `POST /api/lookup { word }` → calls Claude with a prompt
  that returns structured JSON: `{ lemma, partOfSpeech, englishMeanings[],
  grammar: {...} }` (shape depends on part of speech — verb tenses, noun
  gender/plural/definite forms, adjective agreement).
- Test against a handful of real words: a regular verb, an irregular verb,
  an `en`-word, an `ett`-word, an adjective. Confirm output quality/shape
  is good enough before building the UI around it.
- Once validated, add a Supabase table `dictionary_cache(word, data
  jsonb, created_at)` and make the route check-cache-then-call-then-store.

## Phase 2 — Database schema
Supabase Postgres tables (adjust as needed while building):
- `profiles` (id = auth user id, display_name, created_at)
- `texts` (id, owner_id nullable for shared/library texts, title, source
  = 'pdf'|'generated'|'pasted', content, level, created_at)
- `highlights` (id, text_id, profile_id, start_offset, end_offset,
  selected_text, note, created_at)
- `vocab_items` (id, profile_id, word, srs_state jsonb, due_at, source_text_id
  nullable)
- `lesson_progress` (profile_id, lesson_id, status, updated_at)
- `dictionary_cache` (word, data jsonb, created_at) — shared across profiles

Row-level security: scope all per-user tables to `auth.uid()`; guest mode
bypasses this entirely (browser-only, no Supabase writes).

## Phase 3 — Reader page
- Text view: render stored text, tokenize into clickable word spans.
- Click word → call `/api/lookup`, show result in side panel (desktop) —
  per design, persistent panel with grammar table + notes field.
- Responsive: side panel becomes a bottom sheet on narrow viewports.
- Text selection → highlight (persist to `highlights`) → attach a note.
- "My texts" list/library view to pick a text to open.

## Phase 4 — PDF import
- Upload UI → Supabase Storage.
- API route extracts text server-side from the uploaded PDF, creates a
  `texts` row with `source = 'pdf'`, redirects into the reader.
- Handle extraction failures (e.g. scanned/non-text PDFs) with a clear
  error rather than silently producing garbage.

## Phase 5 — Beginner reading material generation
- API route: generate a short leveled Swedish text via Claude (rough
  CEFR-ish tiers), save as a `texts` row with `source = 'generated'`.
- Simple UI to request "give me a new beginner text" from the reader's
  text-library view.

## Phase 6 — Vocabulary section
- List/table view of `vocab_items` for the signed-in profile (word,
  meaning, next review) — default landing view per design.
- "Add to vocab" action from a word lookup in the reader.
- "Drill due words" → one-card-at-a-time flashcard flow (SM-2 scheduling,
  Again/Hard/Good/Easy ratings updating `srs_state`/`due_at`).

## Phase 7 — Grammar lessons
- Static (or Claude-assisted draft, human-reviewed) lesson content: en/ett,
  definite forms, present tense, word order, etc.
- Sidebar chapter-list layout per design; lesson pages can link to related
  vocab/texts.
- `lesson_progress` tracks read/unread per profile (lightweight — no
  forced linear gating).

## Phase 8 — Guest mode
- Entry screen offers "Sign in with Google" or "Continue as guest."
- Guest mode mirrors the same features but reads/writes everything
  (highlights, vocab, progress) to localStorage instead of Supabase.
- Clearly communicate in-app that guest data doesn't sync/survive browser
  storage clears.

## Phase 9 — Deploy
- Push to a Git repo, connect to Vercel, set environment variables there.
- Verify Google OAuth redirect URLs are configured for the production
  domain in both Supabase and Google Cloud console.

## Suggested order of work
Phase 0 → 1 (spike/validate the riskiest part first) → 2 → 3 → 4 → 6 → 7
→ 5 → 8 → 9. Reading + vocab + grammar (the core value) before PDF import
and generated content polish, with guest mode and deploy last.
