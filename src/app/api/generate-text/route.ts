import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;
type Level = (typeof LEVELS)[number];

const LEVEL_GUIDANCE: Record<Level, string> = {
  A1: "Very short (60-100 words). Only the most common words, present tense, simple sentences.",
  A2: "Short (100-150 words). Common vocabulary, simple past tense is fine, mostly simple sentences with the occasional conjunction.",
  B1: "Medium length (150-250 words). Everyday vocabulary, mixed tenses, some subordinate clauses.",
  B2: "Longer (250-350 words). Varied vocabulary, idiomatic phrasing, more complex sentence structure.",
};

const SYSTEM_PROMPT = `You are a Swedish language teacher writing graded reading material for English-speaking learners.
Respond with ONLY a JSON object, no prose, matching this shape:

{ "title": string, "content": string }

"content" is the full text body, in Swedish, written entirely in plain prose (no markdown, no headings).
Respond with raw JSON only — no markdown code fences, no explanation.`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const isGuest = req.cookies.get("guestMode")?.value === "1";
  if (!userData.user && !isGuest) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let level: unknown;
  let topic: unknown;
  try {
    const body = await req.json();
    level = body?.level;
    topic = body?.topic;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof level !== "string" || !LEVELS.includes(level as Level)) {
    return NextResponse.json(
      { error: `'level' must be one of: ${LEVELS.join(", ")}` },
      { status: 400 },
    );
  }
  if (topic !== undefined && (typeof topic !== "string" || topic.length > 200)) {
    return NextResponse.json({ error: "Invalid 'topic'" }, { status: 400 });
  }

  const topicLine = topic && topic.trim() ? `Topic: ${topic.trim()}.` : "Pick any everyday topic suitable for a beginner.";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Write a CEFR level ${level} Swedish reading text. ${LEVEL_GUIDANCE[level as Level]} ${topicLine}`,
      },
    ],
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

  const { title, content } =
    typeof parsed === "object" && parsed !== null
      ? (parsed as { title?: unknown; content?: unknown })
      : {};

  if (typeof title !== "string" || typeof content !== "string" || !title.trim() || !content.trim()) {
    return NextResponse.json(
      { error: "Model response missing 'title' or 'content'" },
      { status: 502 },
    );
  }

  if (!userData.user) {
    // Guest: nothing to persist server-side — the client saves this to
    // localStorage itself.
    return NextResponse.json({ title: title.trim(), content: content.trim() });
  }

  const { data: text, error: insertError } = await supabase
    .from("texts")
    .insert({
      owner_id: userData.user.id,
      title: title.trim(),
      source: "generated",
      content: content.trim(),
      level,
    })
    .select("id")
    .single();

  if (insertError || !text) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to save text" },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: text.id });
}
