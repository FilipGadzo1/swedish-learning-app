"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="rounded-lg border border-hairline bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste Swedish text here..."
        rows={5}
        className="rounded-lg border border-hairline bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-lg bg-accent px-4 py-2 text-sm font-medium text-foreground hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Add text"}
      </button>
    </form>
  );
}
