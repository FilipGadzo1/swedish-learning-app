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
import Link from "next/link";
import LookupPanelContent, { type LookupData } from "@/app/texts/[id]/LookupPanelContent";
import { POS_GROUPS, posGroupKey } from "@/lib/vocabCategories";

export type VocabListRow = {
  id: string;
  word: string;
  isHard?: boolean;
  meanings: string[];
  lookup: LookupData | null;
};

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
    items: items
      .filter((item) => posGroupKey(item.lookup?.partOfSpeech) === g.key)
      .sort((a, b) => a.word.localeCompare(b.word)),
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
          {groups.length > 1 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Practice only:</span>
              {groups.map((group) => (
                <Link
                  key={group.key}
                  href={`/vocab/drill?pos=${group.key}&start=1`}
                  className="rounded-full border border-hairline px-3 py-1 text-xs hover:bg-accent/15"
                >
                  {group.label} ({group.items.length})
                </Link>
              ))}
            </div>
          )}
          {groups.length === 0 ? (
            <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
              No vocabulary yet.
            </Card>
          ) : (
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.items.map((item) => {
                          const isSelected = selected?.id === item.id;
                          return (
                            <TableRow
                              key={item.id}
                              onClick={() => setSelected(item)}
                              className={`cursor-pointer ${isSelected ? "bg-accent/15 hover:bg-accent/15" : ""}`}
                            >
                              <TableCell className="px-4 font-serif">
                                {item.word}
                                {item.isHard && (
                                  <span className="ml-1.5 text-accent" title="Hard word" aria-label="Hard word">
                                    ★
                                  </span>
                                )}
                              </TableCell>
                              <TableCell
                                className={`px-4 ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
                              >
                                {item.meanings.join(", ")}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Card>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
          )}
        </div>
      </main>

      {/* Desktop: persistent side panel */}
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-hairline bg-surface p-5 md:block">
        {panel || <p className="text-sm text-muted-foreground">Click a word to see its grammar.</p>}
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
