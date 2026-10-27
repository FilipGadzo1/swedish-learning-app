// SM-2 spaced repetition. srs_state is stored as this shape in vocab_items.
export type SrsState = {
  ef: number; // easiness factor
  interval: number; // days until next review
  repetitions: number;
};

export const DEFAULT_SRS_STATE: SrsState = { ef: 2.5, interval: 0, repetitions: 0 };

export type Rating = "again" | "hard" | "good" | "easy";

// Maps our four buttons onto SM-2's 0-5 quality scale.
const QUALITY: Record<Rating, number> = { again: 2, hard: 3, good: 4, easy: 5 };

export function nextSrsState(
  prev: SrsState | null | undefined,
  rating: Rating,
): { state: SrsState; dueAt: Date } {
  const state = prev ?? DEFAULT_SRS_STATE;
  const quality = QUALITY[rating];

  let { ef, interval, repetitions } = state;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * ef);
  }

  ef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + interval);

  return { state: { ef, interval, repetitions }, dueAt };
}
