"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, FieldLabel, Input, Textarea } from "@tessera/ui";
import { createClient } from "@/lib/supabase/client";
import { addGuestText } from "@/lib/guest";
import ErrorMessage from "@/components/ErrorMessage";

export default function AddTextForm({ guest = false }: { guest?: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError(null);

    if (guest) {
      const text = addGuestText({
        title: title.trim(),
        source: "pasted",
        content: content.trim(),
        level: null,
      });
      setSubmitting(false);
      router.push(`/texts/${text.id}`);
      return;
    }

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("You must be signed in.");
      setSubmitting(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("texts")
      .insert({
        owner_id: userData.user.id,
        title: title.trim(),
        source: "pasted",
        content: content.trim(),
      })
      .select("id")
      .single();

    setSubmitting(false);

    if (insertError || !data) {
      setError(insertError?.message ?? "Failed to save text");
      return;
    }

    router.push(`/texts/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Field>
        <FieldLabel>Title</FieldLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field>
        <FieldLabel>Text</FieldLabel>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste Swedish text here..."
          rows={5}
        />
      </Field>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button type="submit" loading={submitting} className="self-start">
        Add text
      </Button>
    </form>
  );
}
