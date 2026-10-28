"use client";

import { Button } from "@tessera/ui";
import ErrorMessage from "@/components/ErrorMessage";
import SpeakButton from "@/components/SpeakButton";

type LookupGrammar = Record<string, string>;

export type LookupData = {
  lemma: string;
  partOfSpeech: string;
  englishMeanings: string[];
  notes: string | null;
  grammar: LookupGrammar;
  recognized?: boolean;
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
  onAddVocab,
  addingVocab,
  addedVocab,
}: {
  word: string;
  loading: boolean;
  error: string | null;
  data: LookupData | null;
  onAddVocab?: () => void;
  addingVocab?: boolean;
  addedVocab?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1">
        <h2 className="font-serif text-xl font-semibold">{word}</h2>
        <SpeakButton text={word} />
      </div>

      {loading && <p className="mt-2 text-sm text-muted-foreground">Looking up...</p>}
      {error && <ErrorMessage className="mt-2">{error}</ErrorMessage>}

      {data && (
        <div className="mt-2 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {data.partOfSpeech}
          </p>
          <p className="font-serif text-base">{data.englishMeanings.join(", ")}</p>

          {Object.keys(data.grammar).length > 0 && (
            <table className="w-full text-xs">
              <tbody>
                {Object.entries(data.grammar).map(([key, value]) => (
                  <tr key={key} className="border-t border-hairline">
                    <td className="py-1.5 pr-2 text-muted-foreground">
                      {GRAMMAR_LABELS[key] ?? key}
                    </td>
                    <td className="py-1.5 font-medium text-accent">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {data.notes && (
            <p className="font-serif text-xs italic text-muted-foreground">{data.notes}</p>
          )}

          {onAddVocab && data.recognized !== false && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddVocab}
              loading={addingVocab}
              disabled={addedVocab}
              className="self-start"
            >
              {addedVocab ? "Added to vocabulary" : "+ Add to vocabulary"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
