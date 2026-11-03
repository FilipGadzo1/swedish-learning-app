export const POS_GROUPS = [
  { key: "noun", label: "Nouns" },
  { key: "verb", label: "Verbs" },
  { key: "adjective", label: "Adjectives" },
  { key: "adverb", label: "Adverbs" },
  { key: "other", label: "Other" },
] as const;

export type PosKey = (typeof POS_GROUPS)[number]["key"];

const KNOWN_POS = new Set<string>(["noun", "verb", "adjective", "adverb"]);

// Collapses a raw partOfSpeech value (possibly missing/unknown) to one of the group keys.
export function posGroupKey(pos: string | null | undefined): PosKey {
  return KNOWN_POS.has(pos ?? "") ? (pos as PosKey) : "other";
}

// Parses the ?pos= query value; anything unrecognised means "all words".
export function parsePosParam(value: string | string[] | undefined): PosKey | null {
  const v = Array.isArray(value) ? value[0] : value;
  return POS_GROUPS.find((g) => g.key === v)?.key ?? null;
}

export function posLabel(key: PosKey): string {
  return POS_GROUPS.find((g) => g.key === key)!.label;
}
