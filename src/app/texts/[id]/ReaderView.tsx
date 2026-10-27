"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tessera/ui";
import { createClient } from "@/lib/supabase/client";
import { tokenize } from "@/lib/tokenize";
import { DEFAULT_SRS_STATE } from "@/lib/srs";
import LookupPanelContent, { type LookupData } from "./LookupPanelContent";

export default function ReaderView({
  text,
}: {
  text: { id: string; title: string; content: string; source: string };
}) {
  const tokens = tokenize(text.content);
  const router = useRouter();

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [lookupData, setLookupData] = useState<LookupData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [addingVocab, setAddingVocab] = useState(false);
  const [addedVocab, setAddedVocab] = useState(false);
  const [notedWords, setNotedWords] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const lookupCacheRef = useRef<Map<string, LookupData>>(new Map());
  const activeWordRef = useRef<string | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text.content);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy text — your browser may be blocking clipboard access.");
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function loadNotedWords() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from("highlights")
        .select("selected_text, note")
        .eq("text_id", text.id)
        .eq("profile_id", userData.user.id)
        .not("note", "is", null);

      if (cancelled || !data) return;
      setNotedWords(
        new Set(data.filter((h) => h.note && h.note.trim()).map((h) => h.selected_text)),
      );
    }
    loadNotedWords();
    return () => {
      cancelled = true;
    };
  }, [text.id]);

  async function handleWordClick(word: string) {
    activeWordRef.current = word;
    setSelectedWord(word);
    setError(null);
    setNote("");
    setNoteId(null);
    setNoteSaved(false);
    setAddedVocab(false);

    const cached = lookupCacheRef.current.get(word.toLowerCase());
    setLookupData(cached ?? null);
    setLoading(!cached);

    try {
      let data: LookupData;
      if (cached) {
        data = cached;
      } else {
        const res = await fetch("/api/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Lookup failed (${res.status})`);
        }
        data = await res.json();
        lookupCacheRef.current.set(word.toLowerCase(), data);
        lookupCacheRef.current.set(data.lemma.toLowerCase(), data);
        if (activeWordRef.current !== word) return;
        setLookupData(data);
      }

      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const [{ data: existing }, { data: existingHighlight }] = await Promise.all([
          supabase
            .from("vocab_items")
            .select("word")
            .eq("profile_id", userData.user.id)
            .eq("word", data.lemma.toLowerCase())
            .maybeSingle(),
          supabase
            .from("highlights")
            .select("id, note")
            .eq("text_id", text.id)
            .eq("profile_id", userData.user.id)
            .eq("selected_text", word)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);
        if (activeWordRef.current !== word) return;
        if (existing) setAddedVocab(true);
        if (existingHighlight) {
          setNoteId(existingHighlight.id);
          setNote(existingHighlight.note ?? "");
        }
      }
    } catch (err) {
      if (activeWordRef.current === word) {
        setError(err instanceof Error ? err.message : "Lookup failed");
      }
    } finally {
      if (activeWordRef.current === word) setLoading(false);
    }
  }

  async function handleSaveNote() {
    if (!selectedWord) return;
    setSavingNote(true);
    setNoteSaved(false);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");

      if (noteId) {
        const { error: updateError } = await supabase
          .from("highlights")
          .update({ note })
          .eq("id", noteId);
        if (updateError) throw new Error(updateError.message);
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("highlights")
          .insert({
            text_id: text.id,
            profile_id: userData.user.id,
            start_offset: 0,
            end_offset: 0,
            selected_text: selectedWord,
            note,
          })
          .select("id")
          .single();
        if (insertError) throw new Error(insertError.message);
        setNoteId(inserted.id);
      }
      setNoteSaved(true);
      setNotedWords((prev) => {
        const next = new Set(prev);
        if (note.trim()) next.add(selectedWord);
        else next.delete(selectedWord);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSavingNote(false);
    }
  }

  async function handleAddVocab() {
    if (!lookupData) return;
    setAddingVocab(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");

      const lemma = lookupData.lemma.toLowerCase();

      // vocab_items.word has a foreign key into dictionary_cache.word, which
      // is keyed by whatever form was actually looked up — not necessarily
      // the lemma (e.g. "läser" is cached, but "läsa" might not be yet).
      // Look the lemma up too so the cache row exists before inserting.
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
          source_text_id: text.id,
          srs_state: DEFAULT_SRS_STATE,
          due_at: new Date().toISOString(),
        },
        { onConflict: "profile_id,word", ignoreDuplicates: true },
      );
      if (upsertError) throw new Error(upsertError.message);
      setAddedVocab(true);
      // Added via the browser Supabase client — Next has no way to know,
      // so the Vocab page would otherwise show stale data until a hard reload.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to vocab");
    } finally {
      setAddingVocab(false);
    }
  }

  function handleNoteChange(value: string) {
    setNote(value);
    setNoteSaved(false);
  }

  function closePanel() {
    setSelectedWord(null);
    setLookupData(null);
    setError(null);
  }

  function renderTokens(list: ReturnType<typeof tokenize>) {
    return list.map((token, i) =>
      token.isWord ? (
        <span
          key={i}
          onClick={() => handleWordClick(token.text)}
          className={`cursor-pointer rounded px-0.5 hover:bg-accent/15 ${
            selectedWord === token.text ? "bg-accent/30" : ""
          } ${
            notedWords.has(token.text)
              ? "underline decoration-accent decoration-2 underline-offset-2"
              : ""
          }`}
        >
          {token.text}
        </span>
      ) : (
        <span key={i}>{token.text}</span>
      ),
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-start justify-between gap-3">
          <h1 className="font-serif text-2xl font-semibold">
            {renderTokens(tokenize(text.title))}
          </h1>
          <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
            {copied ? "Copied!" : "Copy text"}
          </Button>
        </div>
        <p className="font-serif text-lg leading-8 whitespace-pre-wrap">
          {renderTokens(tokens)}
        </p>
        </div>
      </main>

      {/* Desktop: persistent side panel */}
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-hairline bg-surface p-5 md:block">
        {selectedWord ? (
          <LookupPanelContent
            word={selectedWord}
            loading={loading}
            error={error}
            data={lookupData}
            note={note}
            onNoteChange={handleNoteChange}
            onSaveNote={handleSaveNote}
            savingNote={savingNote}
            noteSaved={noteSaved}
            onAddVocab={handleAddVocab}
            addingVocab={addingVocab}
            addedVocab={addedVocab}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Click a word to look it up.</p>
        )}
      </aside>

      {/* Mobile: bottom sheet */}
      {selectedWord && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
            onClick={closePanel}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[60vh] overflow-y-auto rounded-t-lg border-t border-hairline bg-surface p-4 md:hidden">
            <div className="mb-2 flex justify-center">
              <div className="h-1 w-8 rounded-full bg-hairline" />
            </div>
            <LookupPanelContent
              word={selectedWord}
              loading={loading}
              error={error}
              data={lookupData}
              note={note}
              onNoteChange={handleNoteChange}
              onSaveNote={handleSaveNote}
              savingNote={savingNote}
              noteSaved={noteSaved}
              onAddVocab={handleAddVocab}
              addingVocab={addingVocab}
              addedVocab={addedVocab}
            />
          </div>
        </>
      )}
    </div>
  );
}
