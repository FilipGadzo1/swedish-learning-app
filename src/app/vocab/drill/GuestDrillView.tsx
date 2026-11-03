"use client";

import { useEffect, useState } from "react";
import {
  listGuestTexts,
  listGuestVocab,
  updateGuestVocab,
  type GuestVocabItem,
} from "@/lib/guest";
import type { DrillCard, DrillCardPatch, DrillOptions } from "@/lib/drill";
import DrillScreen, { type DrillText } from "./DrillScreen";

type Loaded = { cards: DrillCard[]; texts: DrillText[] };

function toCard(v: GuestVocabItem): DrillCard {
  return {
    id: v.id,
    word: v.word,
    meanings: v.englishMeanings,
    grammar: v.grammar,
    partOfSpeech: v.partOfSpeech,
    srsState: v.srsState,
    isHard: v.isHard ?? false,
    sourceTextId: v.sourceTextId,
    dueAt: v.dueAt,
  };
}

export default function GuestDrillView({
  options,
  autoStart,
}: {
  options: DrillOptions;
  autoStart: boolean;
}) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    // Mount-only sync from localStorage (an external source).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded({
      cards: listGuestVocab().map(toCard),
      texts: listGuestTexts().map((t) => ({ id: t.id, title: t.title })),
    });
  }, []);

  async function handleSave(id: string, patch: DrillCardPatch) {
    updateGuestVocab(id, patch);
  }

  if (loaded === null) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 p-6 text-center text-sm text-muted-foreground">
        Loading...
      </main>
    );
  }

  return (
    <DrillScreen
      initialCards={loaded.cards}
      texts={loaded.texts}
      initialOptions={options}
      autoStart={autoStart}
      onSave={handleSave}
    />
  );
}
