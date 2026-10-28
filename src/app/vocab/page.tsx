import Link from "next/link";
import { cookies } from "next/headers";
import { buttonVariants, Card } from "@tessera/ui";
import { createClient, getUser } from "@/lib/supabase/server";
import { GUEST_COOKIE } from "@/lib/guest";
import type { LookupData } from "@/app/texts/[id]/LookupPanelContent";
import GuestVocabView from "./GuestVocabView";
import VocabTableWithLookup from "./VocabTableWithLookup";
import QuickLookup from "./QuickLookup";

// Per-user data (auth + DB reads) — must run per-request, not be prerendered.
export const instant = false;

type VocabRow = {
  id: string;
  word: string;
  dictionary_cache: { data: LookupData } | null;
};

export default async function VocabPage() {
  // Auth is gated in proxy.ts (middleware) — by the time this page runs,
  // the request has already been redirected to /login if unauthenticated.
  const { data: userData } = await getUser();
  if (!userData.user) {
    const cookieStore = await cookies();
    if (cookieStore.get(GUEST_COOKIE)?.value === "1") return <GuestVocabView />;
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("vocab_items")
    .select("id, word, dictionary_cache(data)")
    // Least-recently-reviewed first, so practice naturally surfaces weaker words.
    .order("due_at", { ascending: true });

  const items = (data ?? []) as unknown as VocabRow[];

  const header = (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold">Vocabulary</h1>
        {items.length > 0 && (
          <Link href="/vocab/drill" className={buttonVariants()}>
            Practice words
          </Link>
        )}
      </div>
      <QuickLookup />
    </>
  );

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 p-6">
        {header}
        <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
          No vocabulary yet — look up words in a text and add them here.
        </Card>
      </main>
    );
  }

  const rows = items.map((item) => ({
    id: item.id,
    word: item.word,
    meanings: item.dictionary_cache?.data?.englishMeanings ?? [],
    lookup: item.dictionary_cache?.data ?? null,
  }));

  return <VocabTableWithLookup items={rows}>{header}</VocabTableWithLookup>;
}
