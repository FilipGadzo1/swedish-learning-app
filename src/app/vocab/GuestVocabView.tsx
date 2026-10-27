"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants, Card } from "@tessera/ui";
import { listGuestVocab, type GuestVocabItem } from "@/lib/guest";
import VocabTableWithLookup, { type VocabListRow } from "./VocabTableWithLookup";
import QuickLookup from "./QuickLookup";

export default function GuestVocabView() {
  const [items, setItems] = useState<GuestVocabItem[] | null>(null);

  useEffect(() => {
    function load() {
      setItems(listGuestVocab().sort((a, b) => a.dueAt.localeCompare(b.dueAt)));
    }
    load();
  }, []);

  if (items === null) return null;

  const now = new Date();
  const dueCount = items.filter((i) => new Date(i.dueAt) <= now).length;

  const header = (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold">Vocabulary</h1>
        {dueCount > 0 && (
          <Link href="/vocab/drill" className={buttonVariants()}>
            Drill {dueCount} due word{dueCount === 1 ? "" : "s"}
          </Link>
        )}
      </div>
      <QuickLookup guest />
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

  const rows: VocabListRow[] = items.map((item) => {
    const due = new Date(item.dueAt);
    const isDue = due <= now;
    return {
      id: item.id,
      word: item.word,
      meanings: item.englishMeanings,
      isDue,
      dueLabel: isDue ? "Due now" : due.toLocaleDateString(),
      dueAt: item.dueAt,
      lookup: {
        lemma: item.word,
        partOfSpeech: item.partOfSpeech,
        englishMeanings: item.englishMeanings,
        notes: null,
        grammar: item.grammar,
      },
    };
  });

  return <VocabTableWithLookup items={rows}>{header}</VocabTableWithLookup>;
}
