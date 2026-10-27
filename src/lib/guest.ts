// Guest mode: mirrors the signed-in data model in localStorage so the app
// works without a Supabase account. Gated by a cookie (not just
// localStorage) because proxy.ts needs to read it on the server to decide
// whether to let an unauthenticated request through.
import type { SrsState } from "@/lib/srs";

export const GUEST_COOKIE = "guestMode";

export type GuestText = {
  id: string;
  title: string;
  source: "pdf" | "generated" | "pasted";
  content: string;
  level: string | null;
  created_at: string;
};

export type GuestVocabItem = {
  id: string;
  word: string;
  englishMeanings: string[];
  partOfSpeech: string;
  grammar: Record<string, string>;
  srsState: SrsState;
  dueAt: string;
  sourceTextId: string | null;
  createdAt: string;
};

const TEXTS_KEY = "guest:texts";
const NOTES_KEY = "guest:notes"; // { [textId]: { [word]: string } }
const VOCAB_KEY = "guest:vocab";
const LESSON_PROGRESS_KEY = "guest:lessonProgress"; // { [slug]: "read" }

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, quota, etc.) — fail silently,
    // guest data just won't persist across reloads.
  }
}

export function enterGuestMode() {
  if (typeof document === "undefined") return;
  document.cookie = `${GUEST_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export function exitGuestMode() {
  if (typeof document !== "undefined") {
    document.cookie = `${GUEST_COOKIE}=; path=/; max-age=0`;
  }
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TEXTS_KEY);
    window.localStorage.removeItem(NOTES_KEY);
    window.localStorage.removeItem(VOCAB_KEY);
    window.localStorage.removeItem(LESSON_PROGRESS_KEY);
  }
}

export function isGuestModeClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${GUEST_COOKIE}=`));
}

export function listGuestTexts(): GuestText[] {
  return readJson<GuestText[]>(TEXTS_KEY, []).sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
}

export function getGuestText(id: string): GuestText | null {
  return listGuestTexts().find((t) => t.id === id) ?? null;
}

export function addGuestText(text: Omit<GuestText, "id" | "created_at">): GuestText {
  const full: GuestText = {
    ...text,
    id: `guest-${crypto.randomUUID()}`,
    created_at: new Date().toISOString(),
  };
  writeJson(TEXTS_KEY, [...listGuestTexts(), full]);
  return full;
}

export function getGuestNote(textId: string, word: string): string {
  const all = readJson<Record<string, Record<string, string>>>(NOTES_KEY, {});
  return all[textId]?.[word] ?? "";
}

export function getGuestNotedWords(textId: string): Set<string> {
  const all = readJson<Record<string, Record<string, string>>>(NOTES_KEY, {});
  return new Set(Object.keys(all[textId] ?? {}).filter((w) => all[textId][w].trim()));
}

export function setGuestNote(textId: string, word: string, note: string) {
  const all = readJson<Record<string, Record<string, string>>>(NOTES_KEY, {});
  const forText = { ...(all[textId] ?? {}) };
  if (note.trim()) forText[word] = note;
  else delete forText[word];
  writeJson(NOTES_KEY, { ...all, [textId]: forText });
}

export function listGuestVocab(): GuestVocabItem[] {
  return readJson<GuestVocabItem[]>(VOCAB_KEY, []);
}

export function isGuestVocabWord(word: string): boolean {
  return listGuestVocab().some((v) => v.word === word);
}

export function addGuestVocab(item: Omit<GuestVocabItem, "id" | "createdAt">) {
  if (isGuestVocabWord(item.word)) return;
  const full: GuestVocabItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  writeJson(VOCAB_KEY, [...listGuestVocab(), full]);
}

export function updateGuestVocabSrs(id: string, srsState: SrsState, dueAt: string) {
  writeJson(
    VOCAB_KEY,
    listGuestVocab().map((v) => (v.id === id ? { ...v, srsState, dueAt } : v)),
  );
}

export function listGuestLessonProgress(): Record<string, "read"> {
  return readJson<Record<string, "read">>(LESSON_PROGRESS_KEY, {});
}

export function markGuestLessonRead(slug: string) {
  writeJson(LESSON_PROGRESS_KEY, { ...listGuestLessonProgress(), [slug]: "read" });
}
