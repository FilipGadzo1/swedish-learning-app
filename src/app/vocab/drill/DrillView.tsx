"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_SRS_STATE, type SrsState } from "@/lib/srs";
import type { DrillCard, DrillCardPatch, DrillOptions } from "@/lib/drill";
import ErrorMessage from "@/components/ErrorMessage";
import DrillScreen, { type DrillText } from "./DrillScreen";

type VocabRow = {
  id: string;
  word: string;
  srs_state: Partial<SrsState> | null;
  due_at: string;
  is_hard: boolean;
  source_text_id: string | null;
  dictionary_cache: {
    data: {
      englishMeanings?: string[];
      partOfSpeech?: string;
      grammar?: Record<string, string>;
    };
  } | null;
};

type Loaded = { cards: DrillCard[]; texts: DrillText[] };

export default function DrillView({
  options,
  autoStart,
}: {
  options: DrillOptions;
  autoStart: boolean;
}) {
  const router = useRouter();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const [vocab, texts] = await Promise.all([
        supabase
          .from("vocab_items")
          .select("id, word, srs_state, due_at, is_hard, source_text_id, dictionary_cache(data)")
          .order("due_at", { ascending: true }),
        supabase.from("texts").select("id, title").order("created_at", { ascending: false }),
      ]);

      if (vocab.error) {
        setError(vocab.error.message);
        return;
      }
      const rows = (vocab.data ?? []) as unknown as VocabRow[];
      setLoaded({
        cards: rows.map((r) => ({
          id: r.id,
          word: r.word,
          meanings: r.dictionary_cache?.data?.englishMeanings ?? [],
          grammar: r.dictionary_cache?.data?.grammar ?? {},
          partOfSpeech: r.dictionary_cache?.data?.partOfSpeech ?? null,
          srsState: { ...DEFAULT_SRS_STATE, ...r.srs_state },
          isHard: r.is_hard,
          sourceTextId: r.source_text_id,
          dueAt: r.due_at,
        })),
        // The texts query only feeds a dropdown, so a failure there isn't fatal.
        texts: texts.data ?? [],
      });
    }
    load();
  }, []);

  async function handleSave(id: string, patch: DrillCardPatch) {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("vocab_items")
      .update({
        ...(patch.srsState && { srs_state: patch.srsState }),
        ...(patch.dueAt && { due_at: patch.dueAt }),
        ...(patch.isHard !== undefined && { is_hard: patch.isHard }),
      })
      .eq("id", id);
    if (updateError) throw new Error(updateError.message);
    // So the Vocab page's due counts/dates are fresh if visited right after.
    router.refresh();
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 p-6">
        <ErrorMessage>{error}</ErrorMessage>
      </main>
    );
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
