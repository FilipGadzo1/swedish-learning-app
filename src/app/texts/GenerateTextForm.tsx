"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Field,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tessera/ui";
import { addGuestText } from "@/lib/guest";
import ErrorMessage from "@/components/ErrorMessage";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;
const TOPICS = ["Travel", "Food", "Daily life", "Weather", "Work", "Family", "Shopping", "Hobbies"];

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Field>
          <FieldLabel>Level</FieldLabel>
          <Select
            value={level}
            onValueChange={(v) => setLevel(v as typeof LEVELS[number])}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field className="flex-1">
          <FieldLabel>Topic (optional)</FieldLabel>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TOPICS.map((t) => (
          <Button
            key={t}
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setTopic(t)}
          >
            {t}
          </Button>
        ))}
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button type="submit" loading={submitting} className="self-start">
        Generate a new text
      </Button>
    </form>
  );
}
