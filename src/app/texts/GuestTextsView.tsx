"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listGuestTexts, type GuestText } from "@/lib/guest";
import AddTextForm from "./AddTextForm";
import ImportPdfForm from "./ImportPdfForm";
import GenerateTextForm from "./GenerateTextForm";

export default function GuestTextsView() {
  const [texts, setTexts] = useState<GuestText[] | null>(null);

  useEffect(() => {
    function load() {
      setTexts(listGuestTexts());
    }
    load();
  }, []);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <h1 className="mb-4 font-serif text-xl font-semibold">Texts</h1>
      <AddTextForm guest />
      <ImportPdfForm guest />
      <GenerateTextForm guest />
      <ul className="mt-6 divide-y divide-hairline rounded-lg border border-hairline bg-surface">
        {texts && texts.length > 0 ? (
          texts.map((t) => (
            <li key={t.id} className="flex items-center justify-between px-4 py-3">
              <Link href={`/texts/${t.id}`} className="font-medium hover:text-accent">
                {t.title}
              </Link>
              <span className="text-xs text-muted">
                {t.source}
                {t.level ? ` · ${t.level}` : ""}
              </span>
            </li>
          ))
        ) : (
          <li className="px-4 py-6 text-center text-sm text-muted">
            No texts yet — paste one above to get started.
          </li>
        )}
      </ul>
    </main>
  );
}
