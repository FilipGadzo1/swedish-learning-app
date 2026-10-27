"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Field,
  FieldLabel,
  FileUpload,
  FileUploadDropzone,
  FileUploadList,
  FileUploadRejections,
  Input,
} from "@tessera/ui";
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Field>
        <FieldLabel>Title</FieldLabel>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field>
        <FieldLabel>PDF file</FieldLabel>
        <FileUpload
          accept="application/pdf"
          maxFiles={1}
          value={file ? [file] : []}
          onValueChange={(files) => setFile(files[0] ?? null)}
        >
          <FileUploadDropzone />
          <FileUploadRejections />
          <FileUploadList />
        </FileUpload>
      </Field>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button type="submit" loading={submitting} disabled={!file} className="self-start">
        Import PDF
      </Button>
    </form>
  );
}
