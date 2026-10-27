"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addGuestText } from "@/lib/guest";
import ErrorMessage from "@/components/ErrorMessage";

export default function ImportPdfForm({ guest = false }: { guest?: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_PDF_BYTES = 4 * 1024 * 1024;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;
    if (file.size > MAX_PDF_BYTES) {
      setError(`PDF is too large (${(file.size / 1024 / 1024).toFixed(1)}MB) — the limit is 4MB.`);
      return;
    }
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("title", title.trim());

    try {
      const res = await fetch("/api/import-pdf", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Import failed (${res.status})`);

      if (guest) {
        const text = addGuestText({
          title: body.title,
          source: "pdf",
          content: body.content,
          level: null,
        });
        router.push(`/texts/${text.id}`);
        return;
      }

      router.push(`/texts/${body.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="rounded-lg border border-hairline bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
      />
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm"
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <button
        type="submit"
        disabled={submitting || !file}
        className="self-start rounded-lg bg-accent px-4 py-2 text-sm font-medium text-foreground hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Importing..." : "Import PDF"}
      </button>
    </form>
  );
}
