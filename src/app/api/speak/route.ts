import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ElevenLabs premade voices — the only ones the free plan can use via the API.
const VOICES = {
  female: "EXAVITQu4vr4xnSDxMaL",
  male: "pNInz6obpgDQGcFmaJgB",
} as const;

// Callers chunk long texts into sentences, so this only has to fit one chunk.
const MAX_CHARS = 600;

// GET (not POST) on purpose: the same text + voice always yields the same
// audio, so a stable URL lets the browser and Vercel's CDN cache it and a
// repeated word never costs ElevenLabs quota twice.
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text")?.trim() ?? "";
  const voice = req.nextUrl.searchParams.get("voice") ?? "female";

  if (text.length === 0 || text.length > MAX_CHARS) {
    return NextResponse.json({ error: "Missing or invalid 'text'" }, { status: 400 });
  }
  if (voice !== "female" && voice !== "male") {
    return NextResponse.json({ error: "Invalid 'voice'" }, { status: 400 });
  }

  // Billable call — same gate as /api/lookup: signed in or guest mode.
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const isGuest = req.cookies.get("guestMode")?.value === "1";
  if (!userData.user && !isGuest) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Voice isn't configured on the server" }, { status: 500 });
  }

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICES[voice]}?output_format=mp3_44100_64`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        language_code: "sv",
      }),
    },
  );

  if (!upstream.ok || !upstream.body) {
    // 401/402/429 all mean "key or quota problem" — nothing the user can fix.
    const quota = [401, 402, 429].includes(upstream.status);
    return NextResponse.json(
      {
        error: quota
          ? "Voice quota reached for now — try again later."
          : "Couldn't generate audio — please try again.",
      },
      { status: 502 },
    );
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
