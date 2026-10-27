import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";

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

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: word.trim() }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json({ error: "No text response from model" }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    return NextResponse.json(
      { error: "Model did not return valid JSON", raw: textBlock.text },
      { status: 502 },
    );
  }

  await supabase
    .from("dictionary_cache")
    .upsert({ word: key, data: parsed }, { onConflict: "word" });

  return NextResponse.json(parsed);
}
