"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button, Card, Progress, ProgressValue } from "@tessera/ui";
import { createClient } from "@/lib/supabase/client";
import { nextSrsState, type SrsState } from "@/lib/srs";
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

export default function DrillView() {
  const [cards, setCards] = useState<VocabCard[] | null>(null);
  const [total, setTotal] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const confirmationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (confirmationTimeoutRef.current) clearTimeout(confirmationTimeoutRef.current);
    };
  }, []);

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
      const loaded = (data ?? []) as unknown as VocabCard[];
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

  async function handleKnew() {
    if (!cards) return;
    const card = cards[0];
    setRating(true);

    try {
      const supabase = createClient();
      const { state, dueAt } = nextSrsState(card.srs_state, "good");
      const { error: updateError } = await supabase
        .from("vocab_items")
        .update({ srs_state: state, due_at: dueAt.toISOString() })
        .eq("id", card.id);
      if (updateError) throw new Error(updateError.message);

      setCards((prev) => (prev ? prev.slice(1) : prev));
      setFlipped(false);
      setCompletedCount((n) => n + 1);
      setConfirmation(`Saved — next review in ${dayLabel(state.interval)}`);
      if (confirmationTimeoutRef.current) clearTimeout(confirmationTimeoutRef.current);
      confirmationTimeoutRef.current = setTimeout(() => setConfirmation(null), CONFIRMATION_MS);
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
      <main className="mx-auto w-full max-w-md flex-1 p-6 text-center text-sm text-muted-foreground">
        Loading...
      </main>
    );
  }

  if (cards.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-serif text-lg">You&rsquo;re all caught up.</p>
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
  const dict = card.dictionary_cache?.data;
  const knewInterval = nextSrsState(card.srs_state, "good").state.interval;

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
            {dict ? (
              <div className="mt-2 flex flex-col gap-2">
                <p className="text-sm">{dict.englishMeanings.join(", ")}</p>
                {Object.keys(dict.grammar).length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {Object.values(dict.grammar).join(" · ")}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No dictionary data cached for this word.</p>
            )}
          </Card>
        </div>
      </div>

      <p role="status" className="h-4 text-xs text-muted-foreground">
        {confirmation}
      </p>

      {flipped && (
        <div className="grid w-full grid-cols-2 gap-2">
          <Button variant="outline" color="neutral" className="h-auto py-2" onClick={handleAgain} disabled={rating}>
            <RateLabel label="Didn't know it" hint="see it again soon" />
          </Button>
          <Button className="h-auto py-2" onClick={handleKnew} disabled={rating}>
            <RateLabel label="Knew it" hint={`next review in ${knewInterval}d`} />
          </Button>
        </div>
      )}
    </main>
  );
}
