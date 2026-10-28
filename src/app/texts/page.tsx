import { cookies } from "next/headers";
import Link from "next/link";
import { createClient, getUser } from "@/lib/supabase/server";
import { GUEST_COOKIE } from "@/lib/guest";
import GuestTextsView from "./GuestTextsView";
import TextList from "./TextList";
import TextHero from "./TextHero";
import { summarizeContent } from "./textSummary";

// Per-user data (auth + DB reads) — must run per-request, not be prerendered.
export const instant = false;

export default async function TextsPage() {
  // Auth is gated in proxy.ts (middleware) — by the time this page runs,
  // the request has already been redirected to /login if unauthenticated,
  // unless they're in guest mode.
  const { data: userData } = await getUser();
  if (!userData.user) {
    const cookieStore = await cookies();
    if (cookieStore.get(GUEST_COOKIE)?.value === "1") return <GuestTextsView />;
    return null;
  }

  const supabase = await createClient();
  const [{ data: texts }, { count: wordCount }] = await Promise.all([
    supabase
      .from("texts")
      .select("id, title, source, level, created_at, content")
      .order("created_at", { ascending: false }),
    supabase.from("vocab_items").select("id", { count: "exact", head: true }),
  ]);

  // Only the derived excerpt/reading time reach the client, not full content.
  const rows = (texts ?? []).map(({ content, ...t }) => ({
    ...t,
    ...summarizeContent(content ?? ""),
  }));

  const words = wordCount ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 2xl:max-w-6xl">
      <h1 className="flex flex-wrap items-baseline gap-x-2 font-serif text-xl font-semibold">
        Texts
        <span className="font-sans text-sm font-normal text-muted-foreground">
          · {rows.length} {rows.length === 1 ? "text" : "texts"} · {words}{" "}
          {words === 1 ? "word" : "words"} saved
          {words > 0 && (
            <>
              {" · "}
              <Link href="/vocab/drill" className="text-accent hover:underline">
                Practice words
              </Link>
            </>
          )}
        </span>
      </h1>
      <TextHero />
      <TextList texts={rows} />
    </main>
  );
}
