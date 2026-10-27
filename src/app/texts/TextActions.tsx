"use client";

import { useState, type ReactNode } from "react";
import { Card } from "@tessera/ui";
import AddTextForm from "./AddTextForm";
import ImportPdfForm from "./ImportPdfForm";
import GenerateTextForm from "./GenerateTextForm";

type ActionKey = "generate" | "upload" | "paste";

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function ActionCard({
  number,
  title,
  expanded,
  onToggle,
  children,
}: {
  number: number;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-none p-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-hairline text-xs text-muted-foreground">
            {number}
          </span>
          <span className="font-medium">{title}</span>
        </span>
        <ChevronIcon expanded={expanded} />
      </button>
      {expanded && <div className="border-t border-hairline px-4 py-4">{children}</div>}
    </Card>
  );
}

export default function TextActions({ guest = false }: { guest?: boolean }) {
  const [expanded, setExpanded] = useState<ActionKey>("generate");

  function toggle(key: ActionKey) {
    setExpanded((current) => (current === key ? current : key));
  }

  return (
    <div className="flex flex-col gap-2">
      <ActionCard
        number={1}
        title="Generate a new text"
        expanded={expanded === "generate"}
        onToggle={() => toggle("generate")}
      >
        <GenerateTextForm guest={guest} />
      </ActionCard>
      <ActionCard
        number={2}
        title="Upload a PDF"
        expanded={expanded === "upload"}
        onToggle={() => toggle("upload")}
      >
        <ImportPdfForm guest={guest} />
      </ActionCard>
      <ActionCard
        number={3}
        title="Paste your own text"
        expanded={expanded === "paste"}
        onToggle={() => toggle("paste")}
      >
        <AddTextForm guest={guest} />
      </ActionCard>
    </div>
  );
}
