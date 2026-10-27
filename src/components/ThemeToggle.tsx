"use client";

import { useLayoutEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "@tessera/ui";
import { applyTheme, getResolvedTheme, setStoredTheme, type Theme } from "@/lib/theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  // Must start as "light" to match the server (which has no window/localStorage
  // to resolve a real theme from) — resolving the real theme happens below,
  // after mount, so the client's first render still matches the server's HTML
  // and React doesn't throw a hydration mismatch.
  const [theme, setTheme] = useState<Theme>("light");

  // Also covers React's dev-mode Strict Mode remount, which resets <html> to
  // only the attributes it manages, clearing the class the init script set —
  // this re-applies it from the same source of truth. No-op in production.
  useLayoutEffect(() => {
    // Mount-only sync from a browser-only source (localStorage/matchMedia),
    // not a cascading update — this is what makes the hydration fix above work.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(getResolvedTheme());
  }, []);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = theme === "dark" ? "light" : "dark";

    // Store click position as CSS vars for the clip-path animation origin.
    document.documentElement.style.setProperty("--vt-x", `${e.clientX}px`);
    document.documentElement.style.setProperty("--vt-y", `${e.clientY}px`);

    const commit = () => {
      // flushSync forces the state update (icon swap) to commit synchronously,
      // so it's captured in the same "after" snapshot as the DOM class change.
      flushSync(() => {
        setStoredTheme(next);
        setTheme(next);
      });
    };

    // View Transitions API: captures old state → runs the callback synchronously
    // (DOM + React commit happen in one frame) → animates to the new state.
    // Fallback: instant toggle for browsers without support.
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (!doc.startViewTransition) {
      commit();
      return;
    }
    doc.startViewTransition(commit);
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
