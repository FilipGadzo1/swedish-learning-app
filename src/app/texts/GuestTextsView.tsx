"use client";

import { useEffect, useState } from "react";
import { listGuestTexts, type GuestText } from "@/lib/guest";
import TextList from "./TextList";
import TextActions from "./TextActions";

export default function GuestTextsView() {
  const [texts, setTexts] = useState<GuestText[] | null>(null);

  useEffect(() => {
    function load() {
      setTexts(listGuestTexts());
    }
    load();
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      <h1 className="mb-4 font-serif text-xl font-semibold">Texts</h1>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="order-1 md:order-2">
          <TextActions guest />
        </div>
        <hr className="order-2 my-2 border-0 border-t border-hairline md:hidden" />
        <div className="order-3 md:order-1">
          <TextList texts={texts ?? []} />
        </div>
      </div>
    </main>
  );
}
