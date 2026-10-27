"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@tessera/ui";
import { tokenize } from "@/lib/tokenize";
import {
  getGuestNote,
  getGuestNotedWords,
  setGuestNote,
  isGuestVocabWord,
  addGuestVocab,
} from "@/lib/guest";
import { DEFAULT_SRS_STATE } from "@/lib/srs";
import LookupPanelContent, { type LookupData } from "./LookupPanelContent";

export default function GuestReaderView({
  text,
}: {
  text: { id: string; title: string; content: string; source: string };
}) {
  const tokens = tokenize(text.content);

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [lookupData, setLookupData] = useState<LookupData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
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
    function load() {
      setNotedWords(getGuestNotedWords(text.id));
    }
    load();
  }, [text.id]);

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

  async function handleWordClick(word: string) {
    activeWordRef.current = word;
    setSelectedWord(word);
    setError(null);
    setNoteSaved(false);
    setNote(getGuestNote(text.id, word));
    setAddedVocab(false);

    const cached = lookupCacheRef.current.get(word.toLowerCase());
    if (cached) {
      setLookupData(cached);
      setLoading(false);
      if (isGuestVocabWord(cached.lemma.toLowerCase())) setAddedVocab(true);
      return;
    }

    setLookupData(null);
    setLoading(true);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Lookup failed (${res.status})`);
      }
      const data: LookupData = await res.json();
      lookupCacheRef.current.set(word.toLowerCase(), data);
      lookupCacheRef.current.set(data.lemma.toLowerCase(), data);
      if (activeWordRef.current !== word) return;
      setLookupData(data);
      if (isGuestVocabWord(data.lemma.toLowerCase())) setAddedVocab(true);
    } catch (err) {
      if (activeWordRef.current === word) {
        setError(err instanceof Error ? err.message : "Lookup failed");
      }
    } finally {
      if (activeWordRef.current === word) setLoading(false);
    }
  }

  function handleNoteChange(value: string) {
    setNote(value);
    setNoteSaved(false);
  }

  function handleSaveNote() {
    if (!selectedWord) return;
    setSavingNote(true);
    setGuestNote(text.id, selectedWord, note);
    setNotedWords((prev) => {
      const next = new Set(prev);
      if (note.trim()) next.add(selectedWord);
      else next.delete(selectedWord);
      return next;
    });
    setNoteSaved(true);
    setSavingNote(false);
  }

  async function handleAddVocab() {
    if (!lookupData) return;
    setAddingVocab(true);
    try {
      const lemma = lookupData.lemma.toLowerCase();
      addGuestVocab({
        word: lemma,
        englishMeanings: lookupData.englishMeanings,
        partOfSpeech: lookupData.partOfSpeech,
        grammar: lookupData.grammar,
        srsState: DEFAULT_SRS_STATE,
        dueAt: new Date().toISOString(),
        sourceTextId: text.id,
      });
      setAddedVocab(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to vocab");
    } finally {
      setAddingVocab(false);
    }
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
