"use client";

import { useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tessera/ui";
import LookupPanelContent, { type LookupData } from "@/app/texts/[id]/LookupPanelContent";

export type VocabListRow = {
  id: string;
  word: string;
  meanings: string[];
  isDue: boolean;
  dueLabel: string;
  lookup: LookupData | null;
};

const POS_GROUPS = [
  { key: "noun", label: "Nouns" },
  { key: "verb", label: "Verbs" },
  { key: "adjective", label: "Adjectives" },
  { key: "adverb", label: "Adverbs" },
  { key: "other", label: "Other" },
] as const;

const KNOWN_POS = new Set<string>(["noun", "verb", "adjective", "adverb"]);

export default function VocabTableWithLookup({
  items,
  children,
}: {
  items: VocabListRow[];
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<VocabListRow | null>(null);

  const groups = POS_GROUPS.map((g) => ({
    ...g,
    items: items.filter((item) => {
      const pos = item.lookup?.partOfSpeech;
      return g.key === "other" ? !KNOWN_POS.has(pos ?? "") : pos === g.key;
    }),
  })).filter((g) => g.items.length > 0);

  const panel = selected && (
    <LookupPanelContent
      word={selected.word}
      loading={false}
      error={selected.lookup ? null : "No dictionary entry saved for this word."}
      data={selected.lookup}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-2xl">
          {children}
          <Accordion multiple defaultValue={groups.map((g) => g.key)}>
            {groups.map((group) => (
              <AccordionItem key={group.key} value={group.key}>
                <AccordionTrigger headingLevel={2}>
                  {group.label} ({group.items.length})
                </AccordionTrigger>
                <AccordionPanel>
                  <Card className="overflow-hidden p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-4 text-xs">Word</TableHead>
                          <TableHead className="px-4 text-xs">Meaning</TableHead>
                          <TableHead className="px-4 text-xs">Next review</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.items.map((item) => (
                          <TableRow
                            key={item.id}
                            onClick={() => setSelected(item)}
                            data-state={selected?.id === item.id ? "selected" : undefined}
                            className="cursor-pointer"
                          >
                            <TableCell className="px-4 font-serif">{item.word}</TableCell>
                            <TableCell className="px-4 text-muted">
                              {item.meanings.join(", ")}
                            </TableCell>
                            <TableCell
                              className={`px-4 ${item.isDue ? "font-medium text-accent" : "text-muted"}`}
                            >
                              {item.dueLabel}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>

      {/* Desktop: persistent side panel */}
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-hairline bg-surface p-5 md:block">
        {panel || <p className="text-sm text-muted">Click a word to see its grammar.</p>}
      </aside>

      {/* Mobile: bottom sheet */}
      {selected && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
            onClick={() => setSelected(null)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[60vh] overflow-y-auto rounded-t-lg border-t border-hairline bg-surface p-4 md:hidden">
            <div className="mb-2 flex justify-center">
              <div className="h-1 w-8 rounded-full bg-hairline" />
            </div>
            {panel}
          </div>
        </>
      )}
    </div>
  );
}
