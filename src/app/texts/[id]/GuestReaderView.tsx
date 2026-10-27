"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@tessera/ui";
import { tokenize } from "@/lib/tokenize";
import { buildRenderUnits } from "@/lib/phrasalVerbs";
import { isGuestVocabWord, addGuestVocab } from "@/lib/guest";
import { DEFAULT_SRS_STATE } from "@/lib/srs";
import LookupPanelContent, { type LookupData } from "./LookupPanelContent";

type SubWord = {
  word: string;
  loading: boolean;
  error: string | null;
  data: LookupData | null;
  adding: boolean;
  added: boolean;
};

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
  const [addingVocab, setAddingVocab] = useState(false);
  const [addedVocab, setAddedVocab] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<{
    key: string;
    matchedText: string;
    words: string[];
  } | null>(null);
  const [phraseData, setPhraseData] = useState<LookupData | null>(null);
  const [phraseLoading, setPhraseLoading] = useState(false);
  const [phraseError, setPhraseError] = useState<string | null>(null);
  const [phraseAddingVocab, setPhraseAddingVocab] = useState(false);
  const [phraseAddedVocab, setPhraseAddedVocab] = useState(false);
  const [subWords, setSubWords] = useState<SubWord[]>([]);
  const [copied, setCopied] = useState(false);
  const lookupCacheRef = useRef<Map<string, LookupData>>(new Map());
  const activeWordRef = useRef<string | null>(null);
  const activePhraseRef = useRef<string | null>(null);
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

  async function fetchLookup(word: string): Promise<LookupData> {
    const cached = lookupCacheRef.current.get(word.toLowerCase());
    if (cached) return cached;
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
    return data;
  }

  function clearPhraseSelection() {
    activePhraseRef.current = null;
    setSelectedPhrase(null);
    setPhraseData(null);
    setPhraseError(null);
    setSubWords([]);
  }

  async function handleWordClick(word: string) {
    clearPhraseSelection();
    activeWordRef.current = word;
    setSelectedWord(word);
    setError(null);
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

  function updateSubWord(index: number, patch: Partial<SubWord>) {
    setSubWords((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  async function handlePhraseClick(key: string, matchedText: string, words: string[]) {
    activeWordRef.current = null;
    setSelectedWord(null);
    setLookupData(null);
    setLoading(false);
    setError(null);

    activePhraseRef.current = key;
    setSelectedPhrase({ key, matchedText, words });
    setPhraseData(null);
    setPhraseError(null);
    setPhraseLoading(true);
    setPhraseAddedVocab(false);
    setSubWords(
      words.map((word) => ({ word, loading: true, error: null, data: null, adding: false, added: false })),
    );

    const phraseTask = (async () => {
      try {
        const data = await fetchLookup(matchedText);
        if (activePhraseRef.current !== key) return;
        setPhraseData(data);
        if (isGuestVocabWord(data.lemma.toLowerCase())) setPhraseAddedVocab(true);
      } catch (err) {
        if (activePhraseRef.current === key) {
          setPhraseError(err instanceof Error ? err.message : "Lookup failed");
        }
      } finally {
        if (activePhraseRef.current === key) setPhraseLoading(false);
      }
    })();

    const subWordTasks = words.map(async (word, index) => {
      try {
        const data = await fetchLookup(word);
        if (activePhraseRef.current !== key) return;
        updateSubWord(index, {
          data,
          loading: false,
          added: isGuestVocabWord(data.lemma.toLowerCase()),
        });
      } catch (err) {
        if (activePhraseRef.current === key) {
          updateSubWord(index, {
            error: err instanceof Error ? err.message : "Lookup failed",
            loading: false,
          });
        }
      }
    });

    await Promise.all([phraseTask, ...subWordTasks]);
  }

  function saveVocab(data: LookupData) {
    addGuestVocab({
      word: data.lemma.toLowerCase(),
      englishMeanings: data.englishMeanings,
      partOfSpeech: data.partOfSpeech,
      grammar: data.grammar,
      srsState: DEFAULT_SRS_STATE,
      dueAt: new Date().toISOString(),
      sourceTextId: text.id,
    });
  }

  async function handleAddVocab() {
    if (!lookupData) return;
    setAddingVocab(true);
    try {
      saveVocab(lookupData);
      setAddedVocab(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to vocab");
    } finally {
      setAddingVocab(false);
    }
  }

  async function handleAddPhraseVocab() {
    if (!phraseData) return;
    setPhraseAddingVocab(true);
    try {
      saveVocab(phraseData);
      setPhraseAddedVocab(true);
    } catch (err) {
      setPhraseError(err instanceof Error ? err.message : "Failed to add to vocab");
    } finally {
      setPhraseAddingVocab(false);
    }
  }

  async function handleAddSubWordVocab(index: number) {
    const data = subWords[index]?.data;
    if (!data) return;
    updateSubWord(index, { adding: true });
    try {
      saveVocab(data);
      updateSubWord(index, { added: true });
    } catch (err) {
      updateSubWord(index, {
        error: err instanceof Error ? err.message : "Failed to add to vocab",
      });
    } finally {
      updateSubWord(index, { adding: false });
    }
  }

  function closePanel() {
    activeWordRef.current = null;
    setSelectedWord(null);
    setLookupData(null);
    setError(null);
    clearPhraseSelection();
  }

  function renderTokens(list: ReturnType<typeof tokenize>, keyPrefix: string) {
    return buildRenderUnits(list).map((unit) => {
      if (unit.kind === "token") {
        const token = list[unit.index];
        return token.isWord ? (
          <span
            key={unit.index}
            onClick={() => handleWordClick(token.text)}
            className={`cursor-pointer rounded px-0.5 hover:bg-accent/15 ${
              selectedWord === token.text ? "bg-accent/30" : ""
            }`}
          >
            {token.text}
          </span>
        ) : (
          <span key={unit.index}>{token.text}</span>
        );
      }

      const phraseKey = `${keyPrefix}-${unit.startIndex}`;
      const members = list.slice(unit.startIndex, unit.endIndex + 1);
      const selected = selectedPhrase?.key === phraseKey;
      return (
        <span
          key={unit.startIndex}
          className="group cursor-pointer rounded px-0.5"
          onClick={() =>
            handlePhraseClick(
              phraseKey,
              unit.matchedText,
              members.filter((t) => t.isWord).map((t) => t.text),
            )
          }
        >
          {members.map((token, j) =>
            token.isWord ? (
              <span
                key={j}
                className={`rounded group-hover:bg-accent/15 ${selected ? "bg-accent/30" : ""}`}
              >
                {token.text}
              </span>
            ) : (
              <span key={j}>{token.text}</span>
            ),
          )}
        </span>
      );
    });
  }

  function renderPanel() {
    if (selectedPhrase) {
      return (
        <>
          <LookupPanelContent
            word={selectedPhrase.matchedText}
            loading={phraseLoading}
            error={phraseError}
            data={phraseData}
            onAddVocab={handleAddPhraseVocab}
            addingVocab={phraseAddingVocab}
            addedVocab={phraseAddedVocab}
          />
          <div className="mt-3 border-t border-hairline pt-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Individual words
            </p>
            <div className="flex flex-col gap-4">
              {subWords.map((sub, index) => (
                <LookupPanelContent
                  key={index}
                  word={sub.word}
                  loading={sub.loading}
                  error={sub.error}
                  data={sub.data}
                  onAddVocab={() => handleAddSubWordVocab(index)}
                  addingVocab={sub.adding}
                  addedVocab={sub.added}
                />
              ))}
            </div>
          </div>
        </>
      );
    }
    if (selectedWord) {
      return (
        <LookupPanelContent
          word={selectedWord}
          loading={loading}
          error={error}
          data={lookupData}
          onAddVocab={handleAddVocab}
          addingVocab={addingVocab}
          addedVocab={addedVocab}
        />
      );
    }
    return <p className="text-sm text-muted-foreground">Click a word to look it up.</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-start justify-between gap-3">
          <h1 className="font-serif text-2xl font-semibold">
            {renderTokens(tokenize(text.title), "title")}
          </h1>
          <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
            {copied ? "Copied!" : "Copy text"}
          </Button>
        </div>
        <p className="font-serif text-lg leading-8 whitespace-pre-wrap">
          {renderTokens(tokens, "body")}
        </p>
        </div>
      </main>

      {/* Desktop: persistent side panel */}
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-hairline bg-surface p-5 md:block">
        {renderPanel()}
      </aside>

      {/* Mobile: bottom sheet */}
      {(selectedWord || selectedPhrase) && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
            onClick={closePanel}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[60vh] overflow-y-auto rounded-t-lg border-t border-hairline bg-surface p-4 md:hidden">
            <div className="mb-2 flex justify-center">
              <div className="h-1 w-8 rounded-full bg-hairline" />
            </div>
            {renderPanel()}
          </div>
        </>
      )}
    </div>
  );
}
