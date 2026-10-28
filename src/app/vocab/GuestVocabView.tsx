"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants, Card } from "@tessera/ui";
import { listGuestVocab, type GuestVocabItem } from "@/lib/guest";
import VocabTableWithLookup, { type VocabListRow } from "./VocabTableWithLookup";
import QuickLookup from "./QuickLookup";

export default function GuestVocabView() {
  const [items, setItems] = useState<GuestVocabItem[] | null>(null);

  function load() {
    setItems(listGuestVocab().sort((a, b) => a.dueAt.localeCompare(b.dueAt)));
  }

  useEffect(() => {
    // Mount-only sync from localStorage (an external source), not a
    // cascading update — `load` is also called later from QuickLookup's
    // onAdded callback, outside any effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  if (items === null) return null;

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
      <QuickLookup guest onAdded={load} />
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

  const rows: VocabListRow[] = items.map((item) => ({
    id: item.id,
    word: item.word,
    meanings: item.englishMeanings,
    lookup: {
      lemma: item.word,
      partOfSpeech: item.partOfSpeech,
      englishMeanings: item.englishMeanings,
      notes: null,
      grammar: item.grammar,
    },
  }));

  return <VocabTableWithLookup items={rows}>{header}</VocabTableWithLookup>;
}
