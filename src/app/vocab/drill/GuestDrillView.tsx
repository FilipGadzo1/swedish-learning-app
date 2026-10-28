"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button, Card, Progress, ProgressValue } from "@tessera/ui";
import { listGuestVocab, updateGuestVocabSrs, type GuestVocabItem } from "@/lib/guest";
import { nextSrsState } from "@/lib/srs";

const REQUEUE_OFFSET = 3;
const CONFIRMATION_MS = 1400;

const dayLabel = (n: number) => `${n} day${n === 1 ? "" : "s"}`;

function RateLabel({ label, hint }: { label: string; hint: string }) {
  return (
    <span className="flex flex-col items-center leading-tight">
      <span>{label}</span>
      <span className="text-[10px] opacity-70">{hint}</span>
    </span>
  );
}

export default function GuestDrillView() {
  const [cards, setCards] = useState<GuestVocabItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const confirmationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (confirmationTimeoutRef.current) clearTimeout(confirmationTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    function load() {
      // Least-recently-reviewed first, so practice naturally surfaces weaker words.
      const loaded = listGuestVocab().sort((a, b) => a.dueAt.localeCompare(b.dueAt));
      setCards(loaded);
      setTotal(loaded.length);
    }
    load();
  }, []);

  function handleAgain() {
    setCards((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const [c] = next.splice(0, 1);
      next.splice(Math.min(REQUEUE_OFFSET, next.length), 0, c);
      return next;
    });
    setFlipped(false);
  }

  function handleKnew() {
    if (!cards) return;
    const card = cards[0];
    const { state, dueAt } = nextSrsState(card.srsState, "good");
    updateGuestVocabSrs(card.id, state, dueAt.toISOString());
    setCards((prev) => (prev ? prev.slice(1) : prev));
    setFlipped(false);
    setCompletedCount((n) => n + 1);
    setConfirmation(`Saved — next review in ${dayLabel(state.interval)}`);
    if (confirmationTimeoutRef.current) clearTimeout(confirmationTimeoutRef.current);
    confirmationTimeoutRef.current = setTimeout(() => setConfirmation(null), CONFIRMATION_MS);
  }

  if (cards === null) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 p-6 text-center text-sm text-muted-foreground">
        Loading...
      </main>
    );
  }

  if (cards.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-serif text-lg">You&rsquo;ve practiced every word.</p>
        {confirmation && (
          <p role="status" className="text-xs text-muted-foreground">
            {confirmation}
          </p>
        )}
        <Link href="/vocab" className="text-sm text-accent hover:opacity-80">
          Back to vocabulary
        </Link>
      </main>
    );
  }

  const card = cards[0];
  const knewInterval = nextSrsState(card.srsState, "good").state.interval;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full flex-col gap-2">
        <Progress value={completedCount} max={total} size="sm" aria-label="Drill progress">
          <ProgressValue className="mx-auto text-xs text-muted-foreground">
            {() => `${completedCount} of ${total} done`}
          </ProgressValue>
        </Progress>
        <p className="text-center text-xs text-muted-foreground">
          Rating updates when you&rsquo;ll see this word again — check the full schedule on the{" "}
          <Link href="/vocab" className="text-accent hover:opacity-80">
            Vocab page
          </Link>
          .
        </p>
      </div>

      {/* Keyed by card so a new card mounts unflipped instead of animating back
          and briefly showing its answer on the back face. */}
      <div
        key={card.id}
        onClick={() => setFlipped(true)}
        className="card-flip-container h-[200px] w-full cursor-pointer"
      >
        <div className={`card-flip-inner h-full w-full ${flipped ? "flipped" : ""}`}>
          <Card className="card-flip-face items-center justify-center gap-3 p-8 text-center">
            <p className="font-serif text-2xl font-semibold">{card.word}</p>
            <p className="text-xs text-muted-foreground">Tap to flip</p>
          </Card>
          <Card className="card-flip-face card-flip-face-back items-center justify-center gap-3 overflow-y-auto p-8 text-center">
            <p className="font-serif text-2xl font-semibold">{card.word}</p>
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-sm">{card.englishMeanings.join(", ")}</p>
              {Object.keys(card.grammar).length > 0 && (
                <p className="text-xs text-muted-foreground">{Object.values(card.grammar).join(" · ")}</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <p role="status" className="h-4 text-xs text-muted-foreground">
        {confirmation}
      </p>

      {flipped && (
        <div className="grid w-full grid-cols-2 gap-2">
          <Button variant="outline" color="neutral" className="h-auto py-2" onClick={handleAgain}>
            <RateLabel label="Didn't know it" hint="see it again soon" />
          </Button>
          <Button className="h-auto py-2" onClick={handleKnew}>
            <RateLabel label="Knew it" hint={`next review in ${knewInterval}d`} />
          </Button>
        </div>
      )}
    </main>
  );
}
