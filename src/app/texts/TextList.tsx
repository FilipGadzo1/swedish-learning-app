"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Badge,
  Card,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tessera/ui";

export type TextListItem = {
  id: string;
  title: string;
  source: string;
  level: string | null;
  created_at: string;
  excerpt: string;
  readingMinutes: number;
};

const SORTS = {
  newest: "Newest first",
  oldest: "Oldest first",
  title: "Title A–Z",
} as const;
type SortKey = keyof typeof SORTS;

const LEVEL_ORDER = ["A1", "A2", "B1", "B2"];

export default function TextList({ texts }: { texts: TextListItem[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  if (texts.length === 0) {
    return (
      <Card className="rounded-none px-4 py-6 text-center text-sm text-muted-foreground">
        No texts yet — generate one above to get started.
      </Card>
    );
  }

  const levelCounts = new Map<string, number>();
  for (const t of texts) {
    const key = t.level ?? "No level";
    levelCounts.set(key, (levelCounts.get(key) ?? 0) + 1);
  }
  const levelBadges = [...LEVEL_ORDER, "No level"].filter((l) => levelCounts.has(l));

  const q = query.trim().toLowerCase();
  const visible = texts
    .filter((t) => t.title.toLowerCase().includes(q))
    .sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "sv");
      const diff = a.created_at.localeCompare(b.created_at);
      return sort === "oldest" ? diff : -diff;
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="search"
          placeholder="Search titles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-40 flex-1"
        />
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORTS) as SortKey[]).map((k) => (
              <SelectItem key={k} value={k}>
                {SORTS[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {levelBadges.map((l) => (
          <Badge key={l} variant="outline" className="text-muted-foreground">
            {l} ({levelCounts.get(l)})
          </Badge>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card className="rounded-none px-4 py-6 text-center text-sm text-muted-foreground">
          No texts match &lsquo;{query.trim()}&rsquo;
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => (
            <Link key={t.id} href={`/texts/${t.id}`} className="group">
              <Card className="rounded-none h-full gap-2 px-4 py-4 transition-colors group-hover:border-accent">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium group-hover:text-accent">{t.title}</span>
                  {t.level && (
                    <Badge variant="outline" className="shrink-0">
                      {t.level}
                    </Badge>
                  )}
                </div>
                {t.excerpt && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">{t.excerpt}</p>
                )}
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <Badge variant="outline">{t.source}</Badge>
                  <span className="text-xs whitespace-nowrap text-muted-foreground">
                    {t.readingMinutes} min read
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
