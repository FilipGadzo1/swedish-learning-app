"use client";

import ErrorMessage from "@/components/ErrorMessage";

type LookupGrammar = Record<string, string>;

export type LookupData = {
  lemma: string;
  partOfSpeech: string;
  englishMeanings: string[];
  notes: string | null;
  grammar: LookupGrammar;
};

const GRAMMAR_LABELS: Record<string, string> = {
  gender: "Gender",
  singularIndefinite: "Singular (indefinite)",
  singularDefinite: "Singular (definite)",
  pluralIndefinite: "Plural (indefinite)",
  pluralDefinite: "Plural (definite)",
  infinitive: "Infinitive",
  present: "Present",
  past: "Past",
  supine: "Supine",
  imperative: "Imperative",
  base: "Base",
  neuter: "Neuter",
  plural: "Plural",
  comparative: "Comparative",
  superlative: "Superlative",
};

export default function LookupPanelContent({
  word,
  loading,
  error,
  data,
  note,
  onNoteChange,
  onSaveNote,
  savingNote,
  noteSaved,
  onAddVocab,
  addingVocab,
  addedVocab,
}: {
  word: string;
  loading: boolean;
  error: string | null;
  data: LookupData | null;
  note: string;
  onNoteChange: (value: string) => void;
  onSaveNote: () => void;
  savingNote: boolean;
  noteSaved: boolean;
  onAddVocab: () => void;
  addingVocab: boolean;
  addedVocab: boolean;
}) {
  return (
    <div>
      <h2 className="font-serif text-xl font-semibold">{word}</h2>

      {loading && <p className="mt-2 text-sm text-muted">Looking up...</p>}
      {error && <ErrorMessage className="mt-2">{error}</ErrorMessage>}

      {data && (
        <div className="mt-2 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide text-muted">
            {data.partOfSpeech}
          </p>
          <p className="font-serif text-base">{data.englishMeanings.join(", ")}</p>

          {Object.keys(data.grammar).length > 0 && (
            <table className="w-full text-xs">
              <tbody>
                {Object.entries(data.grammar).map(([key, value]) => (
                  <tr key={key} className="border-t border-hairline">
                    <td className="py-1.5 pr-2 text-muted">
                      {GRAMMAR_LABELS[key] ?? key}
                    </td>
                    <td className="py-1.5 font-medium text-accent">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {data.notes && (
            <p className="font-serif text-xs italic text-muted">{data.notes}</p>
          )}

          <button
            onClick={onAddVocab}
            disabled={addingVocab || addedVocab}
            className="self-start rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {addedVocab ? "Added to vocab" : addingVocab ? "Adding..." : "+ Add to vocab"}
          </button>

          <div className="mt-2 border-t border-hairline pt-3">
            <label className="mb-1 block text-xs text-muted">
              Your note
            </label>
            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-hairline bg-background px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
            />
            <button
              onClick={onSaveNote}
              disabled={savingNote}
              className="mt-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-foreground hover:opacity-90 disabled:opacity-50"
            >
              {savingNote ? "Saving..." : noteSaved ? "Saved" : "Save note"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
