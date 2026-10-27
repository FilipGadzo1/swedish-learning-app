"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, FieldLabel, Input } from "@tessera/ui";
import { createClient } from "@/lib/supabase/client";
import { addGuestVocab, isGuestVocabWord } from "@/lib/guest";
import { DEFAULT_SRS_STATE } from "@/lib/srs";
import LookupPanelContent, { type LookupData } from "@/app/texts/[id]/LookupPanelContent";

export default function QuickLookup({
  guest = false,
  onAdded,
}: {
  guest?: boolean;
  /** Guest mode has no server page to refresh — the caller re-reads localStorage instead. */
  onAdded?: () => void;
}) {
  const router = useRouter();
  const [word, setWord] = useState("");
  const [lookedUpWord, setLookedUpWord] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LookupData | null>(null);
  const [addingVocab, setAddingVocab] = useState(false);
  const [addedVocab, setAddedVocab] = useState(false);
  const activeWordRef = useRef<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = word.trim();
    if (!trimmed) return;

    activeWordRef.current = trimmed;
    setLookedUpWord(trimmed);
    setError(null);
    setData(null);
    setAddedVocab(false);
    setLoading(true);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Lookup failed (${res.status})`);
      }
      const result: LookupData = await res.json();
      if (activeWordRef.current !== trimmed) return;
      setData(result);

      const lemma = result.lemma.toLowerCase();
      if (guest) {
        if (isGuestVocabWord(lemma)) setAddedVocab(true);
      } else {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data: existing } = await supabase
            .from("vocab_items")
            .select("word")
            .eq("profile_id", userData.user.id)
            .eq("word", lemma)
            .maybeSingle();
          if (activeWordRef.current !== trimmed) return;
          if (existing) setAddedVocab(true);
        }
      }
    } catch (err) {
      if (activeWordRef.current === trimmed) {
        setError(err instanceof Error ? err.message : "Lookup failed");
      }
    } finally {
      if (activeWordRef.current === trimmed) setLoading(false);
    }
  }

  async function handleAddVocab() {
    if (!data) return;
    setAddingVocab(true);
    try {
      const lemma = data.lemma.toLowerCase();

      if (guest) {
        addGuestVocab({
          word: lemma,
          englishMeanings: data.englishMeanings,
          partOfSpeech: data.partOfSpeech,
          grammar: data.grammar,
          srsState: DEFAULT_SRS_STATE,
          dueAt: new Date().toISOString(),
          sourceTextId: null,
        });
        setAddedVocab(true);
        onAdded?.();
        return;
      }

      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");

      // vocab_items.word has a foreign key into dictionary_cache.word, which
      // is keyed by whatever form was actually looked up — not necessarily
      // the lemma. Look the lemma up too so the cache row exists before
      // inserting (same reasoning as the reader's handleAddVocab).
      const lookupRes = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: lemma }),
      });
      if (!lookupRes.ok) {
        const body = await lookupRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to cache dictionary entry for this word");
      }

      const { error: upsertError } = await supabase.from("vocab_items").upsert(
        {
          profile_id: userData.user.id,
          word: lemma,
          source_text_id: null,
          // Explicit — the DB column default is an empty '{}'::jsonb, which
          // crashes the SRS algorithm on first rating (see nextSrsState).
          srs_state: DEFAULT_SRS_STATE,
          due_at: new Date().toISOString(),
        },
        { onConflict: "profile_id,word", ignoreDuplicates: true },
      );
      if (upsertError) throw new Error(upsertError.message);
      setAddedVocab(true);
      // The add happened via the browser Supabase client, invisible to
      // Next.js — the server-rendered list below won't know to re-fetch
      // without this.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to vocab");
    } finally {
      setAddingVocab(false);
    }
  }

  return (
    <Card className="rounded-none mb-4 p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Field className="flex-1">
          <FieldLabel>Look up a word</FieldLabel>
          <Input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="e.g. läsa, katt, stor…"
          />
        </Field>
        <Button type="submit" loading={loading} disabled={!word.trim()}>
          Look up
        </Button>
      </form>

      {lookedUpWord && (
        <div className="mt-4 border-t border-hairline pt-4">
          <LookupPanelContent
            word={lookedUpWord}
            loading={loading}
            error={error}
            data={data}
            onAddVocab={handleAddVocab}
            addingVocab={addingVocab}
            addedVocab={addedVocab}
          />
        </div>
      )}
    </Card>
  );
}
