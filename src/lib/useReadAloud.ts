"use client";

import { useEffect, useState } from "react";
import { speak, stopSpeaking, TEXT_RATE, WORD_RATE } from "./speech";

// Reads `text` aloud sentence by sentence and reports the character range
// being spoken, plus a one-off helper for speaking a single word or phrase.
export function useReadAloud(text: string) {
  const [speaking, setSpeaking] = useState(false);
  const [range, setRange] = useState<{ start: number; end: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  function toggle() {
    if (speaking) {
      stopSpeaking();
      return;
    }
    setError(null);
    setSpeaking(true);
    speak(text, {
      rate: TEXT_RATE,
      onRange: (start, end) => setRange({ start, end }),
      onEnd: () => {
        setSpeaking(false);
        setRange(null);
      },
      onError: setError,
    });
  }

  function speakWord(word: string) {
    setError(null);
    speak(word, { rate: WORD_RATE, onError: setError });
  }

  return { speaking, range, error, toggle, speakWord };
}
