export type PhrasalVerb = {
  id: string;
  /** Canonical display form, e.g. "ta bort" */
  infinitive: string;
  /** The particle word that must immediately follow a verb-form match. */
  particle: string;
  /** Inflected forms of the VERB part only, lowercase, that count as a match. */
  verbForms: string[];
};

export const PHRASAL_VERBS: PhrasalVerb[] = [
  { id: "ta-bort", infinitive: "ta bort", particle: "bort", verbForms: ["ta", "tar", "tog", "tagit"] },
  { id: "ta-pa", infinitive: "ta på", particle: "på", verbForms: ["ta", "tar", "tog", "tagit"] },
  { id: "ta-av", infinitive: "ta av", particle: "av", verbForms: ["ta", "tar", "tog", "tagit"] },
  { id: "ge-upp", infinitive: "ge upp", particle: "upp", verbForms: ["ge", "ger", "gav", "gett", "givit"] },
  { id: "sla-pa", infinitive: "slå på", particle: "på", verbForms: ["slå", "slår", "slog", "slagit"] },
  { id: "stanga-av", infinitive: "stänga av", particle: "av", verbForms: ["stäng", "stänger", "stängde", "stängt"] },
  { id: "komma-pa", infinitive: "komma på", particle: "på", verbForms: ["kom", "kommer", "kommit"] },
  { id: "komma-ihag", infinitive: "komma ihåg", particle: "ihåg", verbForms: ["kom", "kommer", "kommit"] },
  { id: "satta-igang", infinitive: "sätta igång", particle: "igång", verbForms: ["sätt", "sätter", "satte", "satt"] },
  { id: "lagga-till", infinitive: "lägga till", particle: "till", verbForms: ["lägg", "lägger", "lade", "lagt"] },
  { id: "lagga-ner", infinitive: "lägga ner", particle: "ner", verbForms: ["lägg", "lägger", "lade", "lagt"] },
  { id: "skriva-ner", infinitive: "skriva ner", particle: "ner", verbForms: ["skriv", "skriver", "skrev", "skrivit"] },
  { id: "hoppa-over", infinitive: "hoppa över", particle: "över", verbForms: ["hoppa", "hoppar", "hoppade", "hoppat"] },
  { id: "ringa-upp", infinitive: "ringa upp", particle: "upp", verbForms: ["ring", "ringer", "ringde", "ringt"] },
  { id: "plocka-upp", infinitive: "plocka upp", particle: "upp", verbForms: ["plocka", "plockar", "plockade", "plockat"] },
  { id: "tycka-om", infinitive: "tycka om", particle: "om", verbForms: ["tycka", "tycker", "tyckte", "tyckt"] },
];

export type RenderUnit =
  | { kind: "token"; index: number }
  | { kind: "phrase"; verb: PhrasalVerb; startIndex: number; endIndex: number; matchedText: string };

// Only matches verb + particle in direct sequence; separated word order
// ("ta filen bort") is a known limitation.
export function buildRenderUnits(tokens: { text: string; isWord: boolean }[]): RenderUnit[] {
  const units: RenderUnit[] = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token.isWord) {
      const lower = token.text.toLowerCase();
      const candidates = PHRASAL_VERBS.filter((v) => v.verbForms.includes(lower));
      if (candidates.length > 0) {
        let particleIndex = i + 1;
        const next = tokens[particleIndex];
        if (next && !next.isWord && /^\s+$/.test(next.text)) particleIndex++;
        const particleToken = tokens[particleIndex];
        if (particleToken && particleToken.isWord) {
          const particle = particleToken.text.toLowerCase();
          const verb = candidates.find((v) => v.particle === particle);
          if (verb) {
            units.push({
              kind: "phrase",
              verb,
              startIndex: i,
              endIndex: particleIndex,
              matchedText: tokens
                .slice(i, particleIndex + 1)
                .map((t) => t.text)
                .join(""),
            });
            i = particleIndex + 1;
            continue;
          }
        }
      }
    }
    units.push({ kind: "token", index: i });
    i++;
  }
  return units;
}
