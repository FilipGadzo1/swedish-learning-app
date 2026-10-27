import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Kept comfortably under Vercel Serverless Functions' request body limit
// (historically ~4.5MB) so oversized uploads fail with a clear message here
// rather than an opaque platform-level error once deployed.
const MAX_PDF_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const isGuest = req.cookies.get("guestMode")?.value === "1";
  if (!userData.user && !isGuest) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const title = form.get("title");

  if (!(file instanceof File) || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Missing file or title" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
  }
  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: `PDF is too large (${(file.size / 1024 / 1024).toFixed(1)}MB) — the limit is ${MAX_PDF_BYTES / 1024 / 1024}MB.` },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let extractedText: string;
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    extractedText = result.text.trim();
  } catch (err) {
    console.error("PDF extraction failed:", err);
    return NextResponse.json(
      { error: "Could not extract text from this PDF — it may be a scanned image without a text layer." },
      { status: 422 },
    );
  }

  if (!extractedText) {
    console.error("PDF extraction returned empty text. File:", file.name, "size:", buffer.length);
    return NextResponse.json(
      { error: "No text found in this PDF — it may be a scanned image without a text layer." },
      { status: 422 },
    );
  }

  if (!userData.user) {
    // Guest: no account to own the storage upload/DB row — the client
    // saves the extracted text to localStorage itself.
    return NextResponse.json({ title: title.trim(), content: extractedText });
  }

  const admin = createAdminClient();
  const storagePath = `${userData.user.id}/${crypto.randomUUID()}.pdf`;
  const { error: uploadError } = await admin.storage
    .from("pdfs")
    .upload(storagePath, buffer, { contentType: "application/pdf" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: text, error: insertError } = await supabase
    .from("texts")
    .insert({
      owner_id: userData.user.id,
      title: title.trim(),
      source: "pdf",
      content: extractedText,
    })
    .select("id")
    .single();

  if (insertError || !text) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to save text" },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: text.id });
}
