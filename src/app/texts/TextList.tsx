"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tessera/ui";
import ErrorMessage from "@/components/ErrorMessage";
import SparkleBorder from "@/components/SparkleBorder";
import { createClient } from "@/lib/supabase/client";
import { deleteGuestText } from "@/lib/guest";

export type TextListItem = {
  id: string;
  title: string;
  source: string;
  level: string | null;
  created_at: string;
  excerpt: string;
  readingMinutes: number;
  // False for shared library texts, which RLS won't let anyone delete.
  deletable?: boolean;
};

const SORTS = {
  newest: "Newest first",
  oldest: "Oldest first",
  title: "Title A–Z",
} as const;
type SortKey = keyof typeof SORTS;

const LEVEL_ORDER = ["A1", "A2", "B1", "B2"];

export default function TextList({
  texts,
  guest = false,
  onDeleted,
}: {
  texts: TextListItem[];
  guest?: boolean;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TextListItem | null>(null);

  async function handleDelete(t: TextListItem) {
    setPendingDelete(null);
    setDeleteError(null);
    if (guest) {
      deleteGuestText(t.id);
    } else {
      const supabase = createClient();
      // select() so a delete that RLS silently filtered out shows up as zero rows.
      const { data, error } = await supabase.from("texts").delete().eq("id", t.id).select("id");
      if (error || !data || data.length === 0) {
        setDeleteError(error?.message ?? "Couldn't delete this text.");
        return;
      }
    }
    setRemoved((prev) => new Set(prev).add(t.id));
    onDeleted?.();
    router.refresh();
  }

  const shown = texts.filter((t) => !removed.has(t.id));

  if (shown.length === 0) {
    return (
      <Card className="rounded-none px-4 py-6 text-center text-sm text-muted-foreground">
        No texts yet — generate one above to get started.
      </Card>
    );
  }

  const levelCounts = new Map<string, number>();
  for (const t of shown) {
    const key = t.level ?? "No level";
    levelCounts.set(key, (levelCounts.get(key) ?? 0) + 1);
  }
  const levelBadges = [...LEVEL_ORDER, "No level"].filter((l) => levelCounts.has(l));

  const q = query.trim().toLowerCase();
  const visible = shown
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

      {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}

      {visible.length === 0 ? (
        <Card className="rounded-none px-4 py-6 text-center text-sm text-muted-foreground">
          No texts match &lsquo;{query.trim()}&rsquo;
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => (
            <div key={t.id} className="group relative">
              <Link href={`/texts/${t.id}`} className="block h-full">
                <Card className="relative rounded-none h-full gap-2 px-4 py-4 transition-colors group-hover:border-accent">
                  <SparkleBorder count={10} />
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
                  <div
                    className={`mt-auto flex items-center justify-between gap-2 pt-1 ${
                      guest || t.deletable ? "pr-8" : ""
                    }`}
                  >
                    <Badge variant="outline">{t.source}</Badge>
                    <span className="text-xs whitespace-nowrap text-muted-foreground">
                      {t.readingMinutes} min read
                    </span>
                  </div>
                </Card>
              </Link>
              {(guest || t.deletable) && (
                <button
                  type="button"
                  aria-label={`Delete ${t.title}`}
                  onClick={() => setPendingDelete(t)}
                  className="absolute right-3 bottom-3 rounded p-1 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive focus-visible:text-destructive"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete text?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{pendingDelete?.title}&rdquo; will be removed. Your saved words stay.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" color="neutral" />}>
              Cancel
            </AlertDialogClose>
            <Button
              color="danger"
              onClick={() => pendingDelete && handleDelete(pendingDelete)}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
