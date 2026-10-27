"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Popover, PopoverContent, PopoverTitle, PopoverTrigger, Switch } from "@tessera/ui";
import { getStoredSparkle, setStoredSparkle } from "@/lib/sparkle";
import {
  getResolvedTheme,
  getStoredPrimary,
  PRIMARY_THEMES,
  setStoredPrimary,
  setStoredTheme,
  type PrimaryTheme,
  type Theme,
} from "@/lib/theme";
import SignOutButton from "./SignOutButton";

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 12.49H3a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export default function SettingsMenu({
  userEmail,
  isGuest,
}: {
  userEmail: string | null;
  isGuest: boolean;
}) {
  // All start at their server-safe defaults; synced from localStorage after
  // mount, same hydration-safety pattern as the old ThemeToggle/SparkleToggle.
  const [sparkle, setSparkle] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [primary, setPrimary] = useState<PrimaryTheme>("carnelian");

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSparkle(getStoredSparkle());
    setTheme(getResolvedTheme());
    setPrimary(getStoredPrimary());
  }, []);

  function toggleDark(checked: boolean) {
    const next: Theme = checked ? "dark" : "light";
    setStoredTheme(next);
    setTheme(next);
  }

  function toggleSparkle(checked: boolean) {
    setStoredSparkle(checked);
    setSparkle(checked);
  }

  function choosePrimary(next: PrimaryTheme) {
    setStoredPrimary(next);
    setPrimary(next);
  }

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Settings" />}>
        <GearIcon />
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-64 flex-col gap-4 p-4">
        <PopoverTitle className="text-sm font-semibold">Settings</PopoverTitle>

        <label className="flex items-center justify-between gap-2 text-sm">
          Dark mode
          <Switch checked={theme === "dark"} onCheckedChange={toggleDark} />
        </label>

        <label className="flex items-center justify-between gap-2 text-sm">
          Glitter mode
          <Switch checked={sparkle} onCheckedChange={toggleSparkle} />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm">Theme color</span>
          <div className="flex items-center gap-2">
            {PRIMARY_THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                aria-label={t.label}
                aria-pressed={primary === t.value}
                onClick={() => choosePrimary(t.value)}
                className={`h-6 w-6 shrink-0 rounded-full border-2 transition-colors ${
                  primary === t.value ? "border-foreground" : "border-transparent"
                }`}
                style={{ backgroundColor: t.swatch }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-hairline pt-3">
          {userEmail ? (
            <>
              <span className="min-w-0 truncate text-xs text-muted-foreground">{userEmail}</span>
              <SignOutButton />
            </>
          ) : isGuest ? (
            <>
              <Badge variant="outline">Guest</Badge>
              <SignOutButton label="Exit guest mode" />
            </>
          ) : (
            <Link href="/login" className="text-sm text-accent hover:underline">
              Sign in
            </Link>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
