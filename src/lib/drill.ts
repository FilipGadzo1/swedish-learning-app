import type { SrsState } from "@/lib/srs";
import { parsePosParam, posGroupKey, type PosKey } from "@/lib/vocabCategories";

export type DrillDirection = "forward" | "reverse";

export const SESSION_SIZES = [10, 20, 0] as const; // 0 = all
export const DEFAULT_SESSION_SIZE = 20;
// A word is flagged as hard automatically once it has been missed this many times.
export const AUTO_HARD_LAPSES = 2;

export type DrillOptions = {
  pos: PosKey | null;
  hard: boolean;
  textId: string | null;
  direction: DrillDirection;
  size: number; // 0 = all matching words
};

export type DrillCard = {
  id: string;
  word: string;
  meanings: string[];
  grammar: Record<string, string>;
  partOfSpeech: string | null;
  srsState: SrsState;
  isHard: boolean;
  sourceTextId: string | null;
  dueAt: string;
};

export type DrillCardPatch = { srsState?: SrsState; dueAt?: string; isHard?: boolean };

type Param = string | string[] | undefined;
const first = (v: Param) => (Array.isArray(v) ? v[0] : v);

// Reads the setup options (and whether to skip the setup screen) from the URL.
export function parseDrillParams(sp: Record<string, Param>): DrillOptions & { start: boolean } {
  const n = Number(first(sp.n));
  return {
    pos: parsePosParam(sp.pos),
    hard: first(sp.hard) === "1",
    textId: first(sp.text) || null,
    direction: first(sp.dir) === "reverse" ? "reverse" : "forward",
    size: SESSION_SIZES.some((s) => s === n) ? n : DEFAULT_SESSION_SIZE,
    start: first(sp.start) === "1",
  };
}

export function matchesFilters(card: DrillCard, o: DrillOptions): boolean {
  if (o.pos && posGroupKey(card.partOfSpeech) !== o.pos) return false;
  if (o.hard && !card.isHard) return false;
  if (o.textId && card.sourceTextId !== o.textId) return false;
  return true;
}

// Most-due first, so the size cut keeps the words that need practice most.
export function selectCards(cards: DrillCard[], o: DrillOptions): DrillCard[] {
  const matching = cards
    .filter((c) => matchesFilters(c, o))
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  return o.size > 0 ? matching.slice(0, o.size) : matching;
}
