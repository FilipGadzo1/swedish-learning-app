"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listGuestVocab, type GuestVocabItem } from "@/lib/guest";

export default function GuestVocabView() {
  const [items, setItems] = useState<GuestVocabItem[] | null>(null);

  useEffect(() => {
    function load() {
      setItems(listGuestVocab().sort((a, b) => a.dueAt.localeCompare(b.dueAt)));
    }
    load();
  }, []);

  if (items === null) return null;

  const now = new Date();
  const dueCount = items.filter((i) => new Date(i.dueAt) <= now).length;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold">Vocabulary</h1>
        {dueCount > 0 && (
          <Link
            href="/vocab/drill"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-foreground hover:opacity-90"
          >
            Drill {dueCount} due word{dueCount === 1 ? "" : "s"}
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-hairline bg-surface px-4 py-6 text-center text-sm text-muted">
          No vocabulary yet — look up words in a text and add them here.
        </p>
      ) : (
        <table className="w-full overflow-hidden rounded-lg border border-hairline bg-surface text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-xs text-muted">
              <th className="px-4 py-2 font-medium">Word</th>
              <th className="px-4 py-2 font-medium">Meaning</th>
              <th className="px-4 py-2 font-medium">Next review</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const due = new Date(item.dueAt);
              const isDue = due <= now;
              return (
                <tr key={item.id} className="border-b border-hairline last:border-b-0">
                  <td className="px-4 py-2.5 font-serif">{item.word}</td>
                  <td className="px-4 py-2.5 text-muted">{item.englishMeanings.join(", ")}</td>
                  <td className={`px-4 py-2.5 ${isDue ? "font-medium text-accent" : "text-muted"}`}>
                    {isDue ? "Due now" : due.toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
