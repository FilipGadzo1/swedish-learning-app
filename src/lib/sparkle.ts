// Sparkle mode: a purely cosmetic "glitter" toggle. Off by default — unlike
// theme, there's no system preference to fall back to and no pre-paint init
// script, since a one-frame flash of "off" is harmless here.
export const SPARKLE_KEY = "sparkle";
export const SPARKLE_EVENT = "sparkle:change";

export function getStoredSparkle(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SPARKLE_KEY) === "1";
  } catch {
    return false;
  }
}

export function applySparkle(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("sparkle", enabled);
}

export function setStoredSparkle(enabled: boolean) {
  applySparkle(enabled);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SPARKLE_KEY, enabled ? "1" : "0");
  } catch {
    // Storage unavailable — the class is still applied for this load.
  }
  window.dispatchEvent(new CustomEvent<boolean>(SPARKLE_EVENT, { detail: enabled }));
}
