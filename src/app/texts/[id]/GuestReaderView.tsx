"use client";

import { useEffect, useState } from "react";
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
  text: { id: string; title: string; content: string };
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

  useEffect(() => {
    function load() {
      setNotedWords(getGuestNotedWords(text.id));
    }
    load();
  }, [text.id]);

  async function handleWordClick(word: string) {
    setSelectedWord(word);
    setLookupData(null);
    setError(null);
    setNoteSaved(false);
    setNote(getGuestNote(text.id, word));
    setAddedVocab(false);
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
      setLookupData(data);
      if (isGuestVocabWord(data.lemma.toLowerCase())) setAddedVocab(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
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

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 font-serif text-2xl font-semibold">{text.title}</h1>
        <p className="font-serif text-lg leading-8 whitespace-pre-wrap">
          {tokens.map((token, i) =>
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
          )}
        </p>
        </div>
      </main>

      {/* Desktop: persistent side panel */}
      <aside className="hidden w-80 shrink-0 border-l border-hairline bg-surface p-5 md:block">
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
          <p className="text-sm text-muted">Click a word to look it up.</p>
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
