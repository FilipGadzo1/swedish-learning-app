# Swedish Learning App — Design

## Intent and why

The user started learning Swedish with Duolingo and felt it taught random,
disconnected words and sentences rather than the actual structure of the
language. They want a personal tool that teaches real grammar (when to use
`en` vs `ett`, definite forms, verb tenses, etc.) and builds real vocabulary,
grounded in genuine reading material rather than arbitrary quiz sentences.
Two people will use it (the user and their spouse), each with their own
progress, from both a PC and a phone.

## Goals

- Read real Swedish text (imported PDFs, or app-supplied beginner-level
  text) with word-level help: hover/right-click any word to see its English
  meaning and full grammar (verb: infinitive/present/past/supine/imperative;
  noun: gender `en`/`ett`, plural, definite forms; adjective: agreement
  forms).
- Highlight words/phrases in a text and attach personal notes to them.
- Import a PDF, extract its text, and read/annotate it the same way as any
  other text.
- A dedicated vocabulary section for drilling words directly (not just
  encountering them in text).
- Structured, textbook-style grammar lessons (e.g. "how `en`/`ett` works",
  "present tense verbs", word order) that exist independently of the reader.
- Usable from both a PC browser and a phone browser, with each user's data
  (highlights, notes, vocab progress, lesson progress) persisted
  server-side and kept separate per account.
- Sign-in via Google (not a hardcoded two-person picker), so a third person
  (or more) can join later without a redesign. A no-signup guest mode is
  also available for quickly trying the app without an account.

## Non-goals

- Audio, pronunciation playback, or speech recognition — explicitly not
  wanted for v1.
- Gamification mechanics (streaks, XP, leaderboards) — not requested.
- A rigid, enforced curriculum — reading material and lesson order should
  be available to browse freely, not gated behind completion.
- Support for arbitrary third-party users / multi-tenant signup — this is a
  two-person personal tool.
- Offline support — acceptable to require internet for v1. The user flagged
  "no internet on a flight" as a real but *future* concern, not a v1
  requirement.

## Anti-goals (would make this a failure even if it "works")

- Turning into another Duolingo-style grab bag of disconnected sentences
  with no grammar grounding — grammar must be explicit and visible, not
  implied.
- Word lookups that give a bare translation with no grammatical
  information — every lookup should show the full inflection picture, not
  just a gloss.

## Prior art / reaction

Duolingo: disliked — vocabulary felt random, no real grammar instruction,
not enough to actually communicate.

## Constraints

- Must run on both PC and phone browsers (responsive web app, not native).
- Must deploy on **Vercel** (frontend + API routes) with **Supabase**
  (Postgres + Storage) as the backend — both already set up by the user.
- Internet connection required; this is accepted.
- No fixed user count — sign-in (Google) must support more than the two
  initial users if a third person joins later. Data is scoped per account.

## Decided: how it gets made

- **Stack:** Next.js (App Router) deployed on Vercel. API routes handle PDF
  text extraction, dictionary/grammar lookups, and reading-material
  generation. Supabase Postgres stores profiles, highlights, notes,
  vocabulary items, SRS progress, lesson progress, and a cache of
  dictionary/grammar lookups. Supabase Storage stores uploaded PDFs.
- **Word lookup / grammar engine (the main technical risk — researched):**
  - Open, free Swedish lexical data exists but is awkward to use directly:
    - **Folkets lexikon** (KTH) — free Swedish↔English dictionary,
      downloadable under CC-BY-SA, but distributed as a dictionary file
      (XDXF), not a hosted API, and has no inflection tables.
    - **SALDO / Karp** (Språkbanken, University of Gothenburg) — a real
      REST API (`https://ws.spraakbanken.gu.se/ws/karp/v4/query`) with
      genuine morphological/inflection data, free under CC-BY-SA, updated
      daily. But it's Swedish-only (no English glosses), research-grade in
      shape, and would need real integration work to parse reliably.
  - **Recommendation (adopted for v1):** use an LLM (Claude) as the lookup
    engine. On first lookup of a given dictionary form, call Claude with a
    prompt that returns structured JSON: English meaning(s), part of
    speech, and the full relevant inflection table (verb tenses, noun
    gender/plural/definite forms, or adjective agreement forms as
    applicable). Cache the result permanently in Supabase keyed by word, so
    it's instant and free on every later lookup by either user. This avoids
    integrating two mismatched open datasets, gives natural-language
    grammar notes, and the cost is bounded (pay once per unique word, ever).
  - Left open as a future improvement, not v1: cross-checking or
    supplementing the LLM output against SALDO/Folkets lexikon for
    accuracy.
- **Beginner reading material:** also LLM-generated (Claude), ideally
  levelled (e.g. rough CEFR-ish tiers) so material matches the user's
  current vocabulary rather than being random.
- **PDF import:** extract text server-side (API route) from an uploaded
  PDF, store the original in Supabase Storage, and feed the extracted text
  into the same reader view used for any other text.
- **Accounts:** Supabase Auth with Google sign-in. Any number of people can
  sign in with their own Google account; all their data (highlights,
  notes, vocab items, progress) is scoped to their account id, so a third
  person can join later with no redesign. A separate **guest mode** skips
  sign-in entirely and stores data in the browser's localStorage only — no
  server sync, no cross-device access, lost if that browser's storage is
  cleared. That trade-off is accepted for guest mode specifically (unlike
  the earlier rejected idea of using localStorage as primary storage for
  everyone).

## Page designs (decided via mockups)

- **Reader page:** text on the left/main area; clicking a word fills a
  **persistent side panel** (not a floating popup) with meaning + full
  grammar table + a notes field, and it stays open while you keep reading.
  On phone width, the side panel isn't viable, so it collapses into a
  **bottom sheet** that slides up on tap and can be swiped away.
- **Vocabulary page:** default view is a **browsable list/table** of every
  tracked word with its meaning and next-review date — not a flashcard
  deck first. A "Drill due words" action launches a **one-card-at-a-time
  flashcard flow** (recall, flip, rate Again/Hard/Good/Easy) using that
  list's due items.
- **Grammar lessons page:** an always-visible **sidebar chapter list**
  (like a textbook table of contents) so any lesson can be jumped to
  directly, rather than a linear Prev/Next-only course flow. Lessons can
  still link out to related vocab/texts.

## Left to the builder

- Exact Postgres schema (profiles, texts, highlights/notes, vocab items,
  SRS state, lesson progress, dictionary cache).
- Spaced-repetition algorithm for the vocabulary section (SM-2 is a
  reasonable default).
- PDF text-extraction library choice (e.g. `pdf-parse`/`pdfjs-dist`).
- Exact grammar lesson content/outline and ordering.
- UI/visual design details (left to a design pass).
- Exact LLM prompt/schema for word-lookup and for generating leveled
  reading material, and how dictionary-cache invalidation/corrections work
  if a lookup is ever wrong.
- Text selection/highlighting implementation (browser Selection/Range APIs
  vs. a per-word tokenized render).

## Suggested validation before full build

Before committing to the LLM-lookup approach across the whole app, spike a
single API route that takes a Swedish word and returns the proposed JSON
shape (meaning + full grammar), tried against a handful of real words
(regular verb, irregular verb, en-word, ett-word, adjective) to confirm
quality is good enough — this is the one piece of real technical risk in
the whole design.
