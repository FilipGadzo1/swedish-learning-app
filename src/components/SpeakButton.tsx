"use client";

import { useState } from "react";
import { SpeakerWaveIcon, StopIcon } from "@heroicons/react/24/outline";
import { speak, stopSpeaking, WORD_RATE } from "@/lib/speech";

// Plays a short Swedish word or phrase.
export default function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (playing) {
      stopSpeaking();
      return;
    }
    setError(null);
    setPlaying(true);
    speak(text, {
      rate: WORD_RATE,
      onEnd: () => setPlaying(false),
      onError: setError,
    });
  }

  const Icon = playing ? StopIcon : SpeakerWaveIcon;
  return (
    <button
      type="button"
      onClick={handleClick}
      title={error ?? undefined}
      aria-label={playing ? `Stop speaking ${text}` : `Hear "${text}" pronounced`}
      className={`shrink-0 rounded p-1 hover:bg-accent/15 hover:text-accent ${
        error ? "text-red-600" : "text-muted-foreground"
      } ${className}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
