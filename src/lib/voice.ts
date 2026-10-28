// Which Swedish voice reads aloud. Stored per browser, like sparkle/theme.
export type Voice = "female" | "male";

export const VOICE_KEY = "voice";

export function getStoredVoice(): Voice {
  if (typeof window === "undefined") return "female";
  try {
    return window.localStorage.getItem(VOICE_KEY) === "male" ? "male" : "female";
  } catch {
    return "female";
  }
}

export function setStoredVoice(voice: Voice) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VOICE_KEY, voice);
  } catch {
    // Storage unavailable — the choice still applies until reload via the caller's state.
  }
}
