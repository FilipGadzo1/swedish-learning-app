"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
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
        <Cog6ToothIcon className="h-5 w-5" />
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
