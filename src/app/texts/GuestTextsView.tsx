"use client";

import { useEffect, useState } from "react";
import { listGuestTexts, type GuestText } from "@/lib/guest";
import AddTextForm from "./AddTextForm";
import ImportPdfForm from "./ImportPdfForm";
import GenerateTextForm from "./GenerateTextForm";
import TextList from "./TextList";

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
      <TextList texts={texts ?? []} />
    </main>
  );
}
