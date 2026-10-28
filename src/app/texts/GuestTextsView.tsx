"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listGuestTexts, listGuestVocab } from "@/lib/guest";
import TextList, { type TextListItem } from "./TextList";
import TextHero from "./TextHero";
import { summarizeContent } from "./textSummary";

type GuestTextsData = { rows: TextListItem[]; wordCount: number };

export default function GuestTextsView() {
  const [data, setData] = useState<GuestTextsData | null>(null);

  useEffect(() => {
    function load() {
      const vocab = listGuestVocab();
      setData({
        rows: listGuestTexts().map(({ content, ...t }) => ({
          ...t,
          ...summarizeContent(content),
        })),
        wordCount: vocab.length,
      });
    }
    load();
  }, []);

  const textCount = data?.rows.length ?? 0;
  const words = data?.wordCount ?? 0;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 2xl:max-w-6xl">
      <h1 className="flex flex-wrap items-baseline gap-x-2 font-serif text-xl font-semibold">
        Texts
        <span className="font-sans text-sm font-normal text-muted-foreground">
          · {textCount} {textCount === 1 ? "text" : "texts"} · {words}{" "}
          {words === 1 ? "word" : "words"} saved
          {words > 0 && (
            <>
              {" · "}
              <Link href="/vocab/drill" className="text-accent hover:underline">
                Practice words
              </Link>
            </>
          )}
        </span>
      </h1>
      <TextHero guest />
      <TextList texts={data?.rows ?? []} />
    </main>
  );
}
