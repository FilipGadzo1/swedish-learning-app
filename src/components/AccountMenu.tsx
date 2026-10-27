"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@tessera/ui";
import SignOutButton from "./SignOutButton";

export default function AccountMenu({
  userEmail,
  isGuest,
}: {
  userEmail: string | null;
  isGuest: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const initial = userEmail ? userEmail[0]?.toUpperCase() : isGuest ? "G" : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-xs font-medium text-muted-foreground"
      >
        {initial ?? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 flex min-w-40 flex-col gap-2 rounded-lg border border-hairline bg-surface p-3 shadow-lg">
          {userEmail ? (
            <>
              <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
              <SignOutButton />
            </>
          ) : isGuest ? (
            <>
              <Badge variant="outline" className="self-start">Guest</Badge>
              <SignOutButton label="Exit guest mode" />
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
