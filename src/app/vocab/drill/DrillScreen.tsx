"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Progress,
  ProgressValue,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tessera/ui";
import ErrorMessage from "@/components/ErrorMessage";
import { nextSrsState } from "@/lib/srs";
import {
  AUTO_HARD_LAPSES,
  matchesFilters,
  selectCards,
  SESSION_SIZES,
  type DrillCard,
  type DrillCardPatch,
  type DrillDirection,
  type DrillOptions,
} from "@/lib/drill";
import { POS_GROUPS, posGroupKey, posLabel, type PosKey } from "@/lib/vocabCategories";

export type DrillText = { id: string; title: string };

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

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      size="sm"
      variant={active ? undefined : "outline"}
      color={active ? undefined : "neutral"}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function SetupRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function DrillScreen({
  initialCards,
  texts,
  initialOptions,
  autoStart,
  onSave,
}: {
  initialCards: DrillCard[];
  texts: DrillText[];
  initialOptions: DrillOptions;
  autoStart: boolean;
  // Persists a change to one word; rejects with an Error if saving failed.
  onSave: (id: string, patch: DrillCardPatch) => Promise<void>;
}) {
  const [all, setAll] = useState(initialCards);
  const [options, setOptions] = useState(initialOptions);
  const [session, setSession] = useState<DrillCard[] | null>(() =>
    autoStart ? selectCards(initialCards, initialOptions) : null,
  );

  function applyPatch(id: string, patch: DrillCardPatch) {
    const merge = (c: DrillCard): DrillCard =>
      c.id === id
        ? {
            ...c,
            srsState: patch.srsState ?? c.srsState,
            dueAt: patch.dueAt ?? c.dueAt,
            isHard: patch.isHard ?? c.isHard,
          }
        : c;
    setAll((prev) => prev.map(merge));
  }

  async function save(id: string, patch: DrillCardPatch) {
    await onSave(id, patch);
    applyPatch(id, patch);
  }

  if (session) {
    return (
      <Session
        // New session = fresh state, even if the card list is the same length.
        key={session.map((c) => c.id).join()}
        initial={session}
        direction={options.direction}
        label={sessionLabel(options, texts)}
        onSave={save}
        onExit={() => setSession(null)}
      />
    );
  }

  return (
    <Setup
      cards={all}
      texts={texts}
      options={options}
      onChange={setOptions}
      onStart={() => setSession(selectCards(all, options))}
    />
  );
}

function sessionLabel(o: DrillOptions, texts: DrillText[]): string | null {
  const parts: string[] = [];
  if (o.pos) parts.push(posLabel(o.pos).toLowerCase());
  if (o.hard) parts.push("hard words");
  if (o.textId) {
    const title = texts.find((t) => t.id === o.textId)?.title;
    if (title) parts.push(`from “${title}”`);
  }
  return parts.length > 0 ? `Practicing ${parts.join(" · ")}` : null;
}

function Setup({
  cards,
  texts,
  options,
  onChange,
  onStart,
}: {
  cards: DrillCard[];
  texts: DrillText[];
  options: DrillOptions;
  onChange: (o: DrillOptions) => void;
  onStart: () => void;
}) {
  const set = (patch: Partial<DrillOptions>) => onChange({ ...options, ...patch });

  const matching = cards.filter((c) => matchesFilters(c, options)).length;
  const willPractice = options.size > 0 ? Math.min(options.size, matching) : matching;

  const posCounts = POS_GROUPS.map((g) => ({
    ...g,
    count: cards.filter((c) => posGroupKey(c.partOfSpeech) === g.key).length,
  })).filter((g) => g.count > 0);
  const hardCount = cards.filter((c) => c.isHard).length;
  const textsWithWords = texts
    .map((t) => ({ ...t, count: cards.filter((c) => c.sourceTextId === t.id).length }))
    .filter((t) => t.count > 0);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="font-serif text-xl font-semibold">Practice words</h1>
        <p className="text-sm text-muted-foreground">
          {cards.length} saved · most-due words come first.
        </p>
      </div>

      <SetupRow label="Session size">
        {SESSION_SIZES.map((s) => (
          <Choice key={s} active={options.size === s} onClick={() => set({ size: s })}>
            {s === 0 ? "All" : s}
          </Choice>
        ))}
      </SetupRow>

      <SetupRow label="Direction">
        {(
          [
            ["forward", "Swedish → English"],
            ["reverse", "English → Swedish"],
          ] as [DrillDirection, string][]
        ).map(([d, label]) => (
          <Choice key={d} active={options.direction === d} onClick={() => set({ direction: d })}>
            {label}
          </Choice>
        ))}
      </SetupRow>

      <SetupRow label="Category">
        <Choice active={options.pos === null} onClick={() => set({ pos: null })}>
          All
        </Choice>
        {posCounts.map((g) => (
          <Choice
            key={g.key}
            active={options.pos === g.key}
            onClick={() => set({ pos: g.key as PosKey })}
          >
            {g.label} ({g.count})
          </Choice>
        ))}
      </SetupRow>

      <SetupRow label="Filters">
        <Choice active={options.hard} onClick={() => set({ hard: !options.hard })}>
          ★ Hard words only ({hardCount})
        </Choice>
      </SetupRow>

      {textsWithWords.length > 0 && (
        <SetupRow label="From text">
          <Select
            value={options.textId ?? "any"}
            onValueChange={(v) => set({ textId: v === "any" ? null : (v as string) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any text</SelectItem>
              {textsWithWords.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.title} ({t.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SetupRow>
      )}

      <div className="flex flex-col gap-2">
        <Button onClick={onStart} disabled={willPractice === 0}>
          {willPractice === 0
            ? "No words match"
            : `Start — ${willPractice} ${willPractice === 1 ? "word" : "words"}`}
        </Button>
        <Link href="/vocab" className="text-center text-sm text-accent hover:opacity-80">
          Back to vocabulary
        </Link>
      </div>
    </main>
  );
}

function Session({
  initial,
  direction,
  label,
  onSave,
  onExit,
}: {
  initial: DrillCard[];
  direction: DrillDirection;
  label: string | null;
  onSave: (id: string, patch: DrillCardPatch) => Promise<void>;
  onExit: () => void;
}) {
  const [cards, setCards] = useState(initial);
  const total = initial.length;
  const [completedCount, setCompletedCount] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const confirmationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Cards already counted as a miss this session, so repeat misses don't inflate lapses.
  const missedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      if (confirmationTimeoutRef.current) clearTimeout(confirmationTimeoutRef.current);
    };
  }, []);

  function updateHead(patch: DrillCardPatch) {
    setCards((prev) =>
      prev.map((c, i) =>
        i === 0
          ? {
              ...c,
              srsState: patch.srsState ?? c.srsState,
              dueAt: patch.dueAt ?? c.dueAt,
              isHard: patch.isHard ?? c.isHard,
            }
          : c,
      ),
    );
  }

  async function persist(id: string, patch: DrillCardPatch): Promise<boolean> {
    try {
      await onSave(id, patch);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      return false;
    }
  }

  function handleAgain() {
    const card = cards[0];
    // Don't reschedule (the word stays due), but record the miss so repeatedly
    // forgotten words get flagged as hard.
    if (!missedRef.current.has(card.id)) {
      missedRef.current.add(card.id);
      const lapses = (card.srsState.lapses ?? 0) + 1;
      const patch: DrillCardPatch = {
        srsState: { ...card.srsState, lapses },
        ...(lapses >= AUTO_HARD_LAPSES && !card.isHard ? { isHard: true } : {}),
      };
      updateHead(patch);
      void persist(card.id, patch);
    }
    setCards((prev) => {
      const next = [...prev];
      const [c] = next.splice(0, 1);
      next.splice(Math.min(REQUEUE_OFFSET, next.length), 0, c);
      return next;
    });
    setFlipped(false);
  }

  async function handleKnew() {
    const card = cards[0];
    setRating(true);
    const { state, dueAt } = nextSrsState(card.srsState, "good");
    const ok = await persist(card.id, { srsState: state, dueAt: dueAt.toISOString() });
    setRating(false);
    if (!ok) return;

    setCards((prev) => prev.slice(1));
    setFlipped(false);
    setCompletedCount((n) => n + 1);
    setConfirmation(`Saved — next review in ${dayLabel(state.interval)}`);
    if (confirmationTimeoutRef.current) clearTimeout(confirmationTimeoutRef.current);
    confirmationTimeoutRef.current = setTimeout(() => setConfirmation(null), CONFIRMATION_MS);
  }

  async function handleToggleHard() {
    const card = cards[0];
    const isHard = !card.isHard;
    if (await persist(card.id, { isHard })) updateHead({ isHard });
  }

  if (cards.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-serif text-lg">
          {completedCount === 1 ? "You practiced 1 word." : `You practiced ${completedCount} words.`}
        </p>
        {confirmation && (
          <p role="status" className="text-xs text-muted-foreground">
            {confirmation}
          </p>
        )}
        <Button onClick={onExit}>Practice more</Button>
        <Link href="/vocab" className="text-sm text-accent hover:opacity-80">
          Back to vocabulary
        </Link>
      </main>
    );
  }

  const card = cards[0];
  const knewInterval = nextSrsState(card.srsState, "good").state.interval;
  const reverse = direction === "reverse";

  const wordFace = (
    <p className="font-serif text-2xl font-semibold">{card.word}</p>
  );
  const meaningFace = (
    <p className={reverse ? "text-xl" : "text-sm"}>
      {card.meanings.length > 0 ? card.meanings.join(", ") : "No dictionary data saved."}
    </p>
  );

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full flex-col gap-2">
        {label && (
          <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
        )}
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
            {reverse ? meaningFace : wordFace}
            <p className="text-xs text-muted-foreground">Tap to flip</p>
          </Card>
          <Card className="card-flip-face card-flip-face-back items-center justify-center gap-3 overflow-y-auto p-8 text-center">
            {wordFace}
            <div className="mt-2 flex flex-col gap-2">
              {meaningFace}
              {Object.keys(card.grammar).length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {Object.values(card.grammar).join(" · ")}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex h-5 w-full items-center justify-between">
        <p role="status" className="text-xs text-muted-foreground">
          {confirmation}
        </p>
        <button
          type="button"
          onClick={handleToggleHard}
          aria-pressed={card.isHard}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {card.isHard ? (
            <StarSolidIcon className="h-4 w-4 text-accent" />
          ) : (
            <StarIcon className="h-4 w-4" />
          )}
          {card.isHard ? "Hard word" : "Mark as hard"}
        </button>
      </div>

      {error && <ErrorMessage className="w-full">{error}</ErrorMessage>}

      {flipped && (
        <div className="grid w-full grid-cols-2 gap-2">
          <Button
            variant="outline"
            color="neutral"
            className="h-auto py-2"
            onClick={handleAgain}
            disabled={rating}
          >
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
