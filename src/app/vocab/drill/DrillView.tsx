"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { nextSrsState, type Rating, type SrsState } from "@/lib/srs";
import ErrorMessage from "@/components/ErrorMessage";

type DictData = {
  englishMeanings: string[];
  partOfSpeech: string;
  grammar: Record<string, string>;
};

type VocabCard = {
  id: string;
  word: string;
  srs_state: SrsState;
  dictionary_cache: { data: DictData } | null;
};

export default function DrillView() {
  const [cards, setCards] = useState<VocabCard[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error: fetchError } = await supabase
        .from("vocab_items")
        .select("id, word, srs_state, dictionary_cache(data)")
        .lte("due_at", new Date().toISOString())
        .order("due_at", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setCards((data ?? []) as unknown as VocabCard[]);
    }
    load();
  }, []);

  async function handleRate(r: Rating) {
    if (!cards) return;
    const card = cards[index];
    setRating(true);

    try {
      const supabase = createClient();
      const { state, dueAt } = nextSrsState(card.srs_state, r);
      const { error: updateError } = await supabase
        .from("vocab_items")
        .update({ srs_state: state, due_at: dueAt.toISOString() })
        .eq("id", card.id);
      if (updateError) throw new Error(updateError.message);

      setFlipped(false);
      setIndex((i) => i + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rating");
    } finally {
      setRating(false);
    }
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 p-6">
        <ErrorMessage>{error}</ErrorMessage>
      </main>
    );
  }

  if (cards === null) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 p-6 text-center text-sm text-muted">
        Loading...
      </main>
    );
  }

  if (cards.length === 0 || index >= cards.length) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-serif text-lg">You&rsquo;re all caught up.</p>
        <Link href="/vocab" className="text-sm text-accent hover:opacity-80">
          Back to vocabulary
        </Link>
      </main>
    );
  }

  const card = cards[index];
  const dict = card.dictionary_cache?.data;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 p-6">
      <p className="text-xs text-muted">
        {index + 1} of {cards.length}
      </p>

      <div
        onClick={() => setFlipped(true)}
        className="flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-hairline bg-surface p-8 text-center"
      >
        <p className="font-serif text-2xl font-semibold">{card.word}</p>
        {!flipped ? (
          <p className="text-xs text-muted">Tap to flip</p>
        ) : dict ? (
          <div className="mt-2 flex flex-col gap-2">
            <p className="text-sm">{dict.englishMeanings.join(", ")}</p>
            {Object.keys(dict.grammar).length > 0 && (
              <p className="text-xs text-muted">
                {Object.values(dict.grammar).join(" · ")}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted">No dictionary data cached for this word.</p>
        )}
      </div>

      {flipped && (
        <div className="grid w-full grid-cols-4 gap-2">
          <button
            onClick={() => handleRate("again")}
            disabled={rating}
            className="rounded-lg border border-hairline py-2 text-xs font-medium hover:border-accent disabled:opacity-50"
          >
            Again
          </button>
          <button
            onClick={() => handleRate("hard")}
            disabled={rating}
            className="rounded-lg border border-hairline py-2 text-xs font-medium hover:border-accent disabled:opacity-50"
          >
            Hard
          </button>
          <button
            onClick={() => handleRate("good")}
            disabled={rating}
            className="rounded-lg border border-hairline py-2 text-xs font-medium hover:border-accent disabled:opacity-50"
          >
            Good
          </button>
          <button
            onClick={() => handleRate("easy")}
            disabled={rating}
            className="rounded-lg bg-accent py-2 text-xs font-medium text-foreground hover:opacity-90 disabled:opacity-50"
          >
            Easy
          </button>
        </div>
      )}
    </main>
  );
}
