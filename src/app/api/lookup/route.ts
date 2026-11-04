import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";

// Strips a markdown code fence if the model wraps its JSON in one despite
// being told not to, and trims surrounding whitespace/prose around the braces.
function extractJsonCandidate(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return body.trim();
  return body.slice(start, end + 1);
}

const MAX_SENTENCE_LENGTH = 500;

async function lookupWord(word: string, sentence: string | null): Promise<unknown> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-5-5",
    // claude-sonnet-5-5 thinks adaptively by default, and thinking tokens
    // count against max_tokens — a tight cap here truncates the JSON output
    // mid-generation whenever the model reasons before answering (same root
    // cause as the generate-text route's B2 failures).
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: sentence ? `Word: ${word}\nSentence: ${sentence}` : word,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from model");
  }

  return JSON.parse(extractJsonCandidate(textBlock.text));
}

const SYSTEM_PROMPT = `You are a Swedish dictionary and grammar reference for an English-speaking learner.
Given a single Swedish word (possibly inflected), respond with ONLY a JSON object, no prose, matching this shape:

{
  "lemma": string,              // dictionary/base form of the word
  "partOfSpeech": "noun" | "verb" | "adjective" | "adverb" | "preposition" | "other",
  "englishMeanings": string[],  // 1-4 concise English translations
  "notes": string | null,       // short usage note if genuinely useful, else null
  "contextNote": string | null, // see "contextNote" rules below
  "grammar": { ... },           // shape depends on partOfSpeech, see below
  "recognized": boolean         // false if this is NOT a real, standard Swedish word
}

If the input is not a real Swedish word — a typo, a name, a word from another
language, or otherwise unrecognizable — set "recognized" to false, "partOfSpeech"
to "other", "grammar" to {}, leave "englishMeanings" as your best guess or an empty
array, and explain in "notes" what the word might be instead (e.g. a likely
misspelling). Otherwise set "recognized" to true.

If partOfSpeech is "noun", grammar must be:
{ "gender": "en" | "ett", "singularIndefinite": string, "singularDefinite": string,
  "pluralIndefinite": string, "pluralDefinite": string }

If partOfSpeech is "verb", grammar must be:
{ "infinitive": string, "present": string, "past": string, "future": string,
  "supine": string, "imperative": string }
("future" uses "kommer att" or "ska" + infinitive, e.g. "kommer att äta")

If partOfSpeech is "adjective", grammar must be:
{ "base": string, "neuter": string, "plural": string, "comparative": string, "superlative": string }

If partOfSpeech is "adverb", "preposition" or "other", grammar must be {} (empty object).

Many Swedish words are homographs, so choosing the right reading matters:
- If the message is "Word: <word>" followed by "Sentence: <sentence>", the learner
  clicked the word inside that sentence. Analyse the word AS USED IN THAT SENTENCE:
  "lemma", "partOfSpeech", "englishMeanings" and "grammar" must all describe the
  reading that fits the sentence, never a more common but wrong reading. Put the
  meaning as used here first in "englishMeanings". If another common reading
  exists, mention it briefly in "notes".
  Example: "åt" in "…göra något åt min garderob" is a preposition (about/to/for),
  NOT the past tense of "äta".
  "contextNote" (sentence given only; otherwise always null): set it ONLY when the
  reading in this sentence is not the one a learner would assume from the bare
  word — a homograph (åt, var, för, bo), a fixed expression/idiom (e.g. "göra
  något åt" = "do something about"), a particle or non-literal use. Write 1-2
  short, plain sentences that (a) name the tempting wrong reading and (b) say what
  in the sentence shows it is the right one. Example for "åt": "Not 'ate' (past of
  äta) — here åt is a preposition: 'göra något åt X' means 'do something about X'."
  Use null when the word has its ordinary reading in the sentence.
- If only a bare word is given, there is no context. Use the most common reading
  for the main fields, but when the word has another common, clearly different
  reading (e.g. "åt" = past of "äta" OR preposition "to/for/about"; "var" =
  "was" OR "where"), mention the other reading(s) in "notes".

If the input is multiple space-separated words forming a Swedish phrasal verb
(verb + particle, e.g. "tar bort", "kom ihåg"), treat the whole phrase as the
lookup target: "lemma" is the infinitive phrase (e.g. "ta bort"), "partOfSpeech"
is "verb", "englishMeanings" translate the phrase as a whole, and "grammar" gives
the phrase's conjugated forms with the particle included each time, e.g.
{ "infinitive": "ta bort", "present": "tar bort", "past": "tog bort",
  "future": "kommer att ta bort", "supine": "tagit bort", "imperative": "ta bort" }.

Respond with raw JSON only — no markdown code fences, no explanation.`;

export async function POST(req: NextRequest) {
  let word: unknown;
  let rawSentence: unknown;
  try {
    const body = await req.json();
    word = body?.word;
    rawSentence = body?.sentence;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof word !== "string" || word.trim().length === 0 || word.length > 100) {
    return NextResponse.json({ error: "Missing or invalid 'word'" }, { status: 400 });
  }

  // Optional: the sentence the word was clicked in, used to pick the right
  // reading of homographs. Anything malformed just falls back to a bare lookup.
  const sentence =
    typeof rawSentence === "string" && rawSentence.trim().length > 0
      ? rawSentence.trim().slice(0, MAX_SENTENCE_LENGTH)
      : null;

  const key = word.trim().toLowerCase();
  const supabase = await createClient();

  // Contextual lookups get their own cache keyed by word + sentence, so a
  // context-free answer in dictionary_cache can never be served for a word
  // that was clicked inside a sentence (and vice versa). If the table hasn't
  // been created yet the select simply errors and we fall through to the model.
  const contextKey = sentence
    ? `${key}|${createHash("sha1").update(sentence).digest("hex")}`
    : null;
  if (contextKey) {
    const { data: contextCached } = await supabase
      .from("contextual_lookup_cache")
      .select("data")
      .eq("key", contextKey)
      .maybeSingle();
    if (contextCached) return NextResponse.json(contextCached.data);
  }

  // Cache hits are a plain read of a table whose own RLS policy already
  // allows anyone to read it ("dictionary cache readable by anyone") — no
  // model call, no write, nothing to gate, so check it before touching auth
  // at all. This is also why word-clicks that are already in the DB should
  // feel instant: no auth round trip, just one lightweight select.
  const { data: cached } = contextKey
    ? { data: null }
    : await supabase.from("dictionary_cache").select("data").eq("word", key).maybeSingle();

  // Cache rows written before "recognized" existed are stale — regenerate them
  // instead of serving data the UI can no longer make a correct decision from.
  // Verb rows cached before "future" existed are stale for the same reason.
  const cachedData = cached?.data as
    | { recognized?: boolean; partOfSpeech?: string; grammar?: Record<string, string> }
    | undefined;
  const cacheIsCurrent =
    typeof cachedData?.recognized === "boolean" &&
    (cachedData.partOfSpeech !== "verb" || !!cachedData.grammar?.future);
  if (cached && cacheIsCurrent) {
    return NextResponse.json(cached.data);
  }

  // Past this point we're about to call the model (billable) and write to
  // the shared cache — that's the part that actually needs gating. Unlike
  // /texts, /vocab, /grammar this route isn't covered by proxy.ts's
  // middleware gate (it only matches page prefixes, not /api/*), so without
  // this check anyone could hit it directly and run up model costs.
  const { data: userData } = await supabase.auth.getUser();
  const isGuest = req.cookies.get("guestMode")?.value === "1";
  if (!userData.user && !isGuest) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Occasionally the model wraps the JSON in a code fence or adds stray
  // prose despite the prompt — extractJsonCandidate() handles that, but if
  // parsing still fails (or the response was truncated), retry once before
  // giving up, since this is usually a one-off formatting glitch.
  let parsed: unknown;
  try {
    parsed = await lookupWord(word.trim(), sentence);
  } catch {
    try {
      parsed = await lookupWord(word.trim(), sentence);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            "The dictionary lookup didn't come back in a usable format — please try again.",
          detail: err instanceof Error ? err.message : String(err),
        },
        { status: 502 },
      );
    }
  }

  if (contextKey) {
    await supabase
      .from("contextual_lookup_cache")
      .upsert({ key: contextKey, data: parsed }, { onConflict: "key", ignoreDuplicates: true });

    // Seed the context-free cache under the lemma, but never overwrite an
    // existing row. vocab_items.word has a foreign key into dictionary_cache,
    // and a lemma first met in context (e.g. "åt" as a preposition) should
    // be saved with that sense, not whatever a bare lookup would guess.
    const result = parsed as { lemma?: unknown; recognized?: unknown };
    if (typeof result.lemma === "string" && result.recognized !== false) {
      await supabase
        .from("dictionary_cache")
        .upsert(
          { word: result.lemma.trim().toLowerCase(), data: parsed },
          { onConflict: "word", ignoreDuplicates: true },
        );
    }
    return NextResponse.json(parsed);
  }

  await supabase
    .from("dictionary_cache")
    .upsert({ word: key, data: parsed }, { onConflict: "word" });

  return NextResponse.json(parsed);
}
