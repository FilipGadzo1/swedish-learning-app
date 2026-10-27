import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { GUEST_COOKIE } from "@/lib/guest";
import GuestVocabView from "./GuestVocabView";

// Per-user data (auth + DB reads) — must run per-request, not be prerendered.
export const instant = false;

type VocabRow = {
  id: string;
  word: string;
  due_at: string;
  dictionary_cache: { data: { englishMeanings: string[]; partOfSpeech: string } } | null;
};

export default async function VocabPage() {
  const supabase = await createClient();
  // Auth is gated in proxy.ts (middleware) — by the time this page runs,
  // the request has already been redirected to /login if unauthenticated.
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    const cookieStore = await cookies();
    if (cookieStore.get(GUEST_COOKIE)?.value === "1") return <GuestVocabView />;
    return null;
  }

  const { data } = await supabase
    .from("vocab_items")
    .select("id, word, due_at, dictionary_cache(data)")
    .order("due_at", { ascending: true });

  const items = (data ?? []) as unknown as VocabRow[];
  const now = new Date();
  const dueCount = items.filter((i) => new Date(i.due_at) <= now).length;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold">Vocabulary</h1>
        {dueCount > 0 && (
          <Link
            href="/vocab/drill"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-foreground hover:opacity-90"
          >
            Drill {dueCount} due word{dueCount === 1 ? "" : "s"}
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-hairline bg-surface px-4 py-6 text-center text-sm text-muted">
          No vocabulary yet — look up words in a text and add them here.
        </p>
      ) : (
        <table className="w-full overflow-hidden rounded-lg border border-hairline bg-surface text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-xs text-muted">
              <th className="px-4 py-2 font-medium">Word</th>
              <th className="px-4 py-2 font-medium">Meaning</th>
              <th className="px-4 py-2 font-medium">Next review</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const meanings = item.dictionary_cache?.data?.englishMeanings ?? [];
              const due = new Date(item.due_at);
              const isDue = due <= now;
              return (
                <tr key={item.id} className="border-b border-hairline last:border-b-0">
                  <td className="px-4 py-2.5 font-serif">{item.word}</td>
                  <td className="px-4 py-2.5 text-muted">{meanings.join(", ")}</td>
                  <td className={`px-4 py-2.5 ${isDue ? "font-medium text-accent" : "text-muted"}`}>
                    {isDue ? "Due now" : due.toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
