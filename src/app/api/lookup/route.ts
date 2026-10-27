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

async function lookupWord(word: string): Promise<unknown> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-5-5",
    // Was 500 — too tight for a verb/adjective entry plus a "recognized: false"
    // explanation, which could silently truncate mid-JSON and fail to parse.
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: word }],
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
  "partOfSpeech": "noun" | "verb" | "adjective" | "adverb" | "other",
  "englishMeanings": string[],  // 1-4 concise English translations
  "notes": string | null,       // short usage note if genuinely useful, else null
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
{ "infinitive": string, "present": string, "past": string, "supine": string,
  "imperative": string }

If partOfSpeech is "adjective", grammar must be:
{ "base": string, "neuter": string, "plural": string, "comparative": string, "superlative": string }

If partOfSpeech is "adverb" or "other", grammar must be {} (empty object).

If the input is multiple space-separated words forming a Swedish phrasal verb
(verb + particle, e.g. "tar bort", "kom ihåg"), treat the whole phrase as the
lookup target: "lemma" is the infinitive phrase (e.g. "ta bort"), "partOfSpeech"
is "verb", "englishMeanings" translate the phrase as a whole, and "grammar" gives
the phrase's conjugated forms with the particle included each time, e.g.
{ "infinitive": "ta bort", "present": "tar bort", "past": "tog bort",
  "supine": "tagit bort", "imperative": "ta bort" }.

Respond with raw JSON only — no markdown code fences, no explanation.`;

export async function POST(req: NextRequest) {
  let word: unknown;
  try {
    const body = await req.json();
    word = body?.word;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof word !== "string" || word.trim().length === 0 || word.length > 100) {
    return NextResponse.json({ error: "Missing or invalid 'word'" }, { status: 400 });
  }

  const key = word.trim().toLowerCase();
  const supabase = await createClient();

  // Cache hits are a plain read of a table whose own RLS policy already
  // allows anyone to read it ("dictionary cache readable by anyone") — no
  // model call, no write, nothing to gate, so check it before touching auth
  // at all. This is also why word-clicks that are already in the DB should
  // feel instant: no auth round trip, just one lightweight select.
  const { data: cached } = await supabase
    .from("dictionary_cache")
    .select("data")
    .eq("word", key)
    .maybeSingle();

  // Cache rows written before "recognized" existed are stale — regenerate them
  // instead of serving data the UI can no longer make a correct decision from.
  if (cached && typeof (cached.data as { recognized?: boolean }).recognized === "boolean") {
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
    parsed = await lookupWord(word.trim());
  } catch {
    try {
      parsed = await lookupWord(word.trim());
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

  await supabase
    .from("dictionary_cache")
    .upsert({ word: key, data: parsed }, { onConflict: "word" });

  return NextResponse.json(parsed);
}
