"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listGuestVocab, updateGuestVocabSrs, type GuestVocabItem } from "@/lib/guest";
import { nextSrsState, type Rating } from "@/lib/srs";

export default function GuestDrillView() {
  const [cards, setCards] = useState<GuestVocabItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    function load() {
      const now = new Date().toISOString();
      setCards(
        listGuestVocab()
          .filter((v) => v.dueAt <= now)
          .sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
      );
    }
    load();
  }, []);

  function handleRate(r: Rating) {
    if (!cards) return;
    const card = cards[index];
    const { state, dueAt } = nextSrsState(card.srsState, r);
    updateGuestVocabSrs(card.id, state, dueAt.toISOString());
    setFlipped(false);
    setIndex((i) => i + 1);
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
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            <p className="text-sm">{card.englishMeanings.join(", ")}</p>
            {Object.keys(card.grammar).length > 0 && (
              <p className="text-xs text-muted">{Object.values(card.grammar).join(" · ")}</p>
            )}
          </div>
        )}
      </div>

      {flipped && (
        <div className="grid w-full grid-cols-4 gap-2">
          <button
            onClick={() => handleRate("again")}
            className="rounded-lg border border-hairline py-2 text-xs font-medium hover:border-accent"
          >
            Again
          </button>
          <button
            onClick={() => handleRate("hard")}
            className="rounded-lg border border-hairline py-2 text-xs font-medium hover:border-accent"
          >
            Hard
          </button>
          <button
            onClick={() => handleRate("good")}
            className="rounded-lg border border-hairline py-2 text-xs font-medium hover:border-accent"
          >
            Good
          </button>
          <button
            onClick={() => handleRate("easy")}
            className="rounded-lg bg-accent py-2 text-xs font-medium text-foreground hover:opacity-90"
          >
            Easy
          </button>
        </div>
      )}
    </main>
  );
}
