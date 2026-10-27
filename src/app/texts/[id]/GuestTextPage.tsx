"use client";

import { useEffect, useState } from "react";
import { getGuestText, type GuestText } from "@/lib/guest";
import GuestReaderView from "./GuestReaderView";

export default function GuestTextPage({ id }: { id: string }) {
  const [text, setText] = useState<GuestText | null | undefined>(undefined);

  useEffect(() => {
    function load() {
      setText(getGuestText(id));
    }
    load();
  }, [id]);

  if (text === undefined) return null;

  if (text === null) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 p-6 text-center text-sm text-muted-foreground">
        Text not found in this browser&rsquo;s guest data.
      </main>
    );
  }

  return <GuestReaderView text={text} />;
}
