"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addGuestText } from "@/lib/guest";
import ErrorMessage from "@/components/ErrorMessage";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

export default function GenerateTextForm({ guest = false }: { guest?: boolean }) {
  const router = useRouter();
  const [level, setLevel] = useState<typeof LEVELS[number]>("A1");
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, topic: topic.trim() || undefined }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Generation failed (${res.status})`);

      if (guest) {
        const text = addGuestText({
          title: body.title,
          source: "generated",
          content: body.content,
          level,
        });
        router.push(`/texts/${text.id}`);
        return;
      }

      router.push(`/texts/${body.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-4">
      <div className="flex gap-2">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as typeof LEVELS[number])}
          className="rounded-lg border border-hairline bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic (optional)"
          className="flex-1 rounded-lg border border-hairline bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-lg bg-accent px-4 py-2 text-sm font-medium text-foreground hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Generating..." : "Generate a new text"}
      </button>
    </form>
  );
}
