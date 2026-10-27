import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { GUEST_COOKIE } from "@/lib/guest";
import AddTextForm from "./AddTextForm";
import ImportPdfForm from "./ImportPdfForm";
import GenerateTextForm from "./GenerateTextForm";
import GuestTextsView from "./GuestTextsView";
import TextList from "./TextList";

// Per-user data (auth + DB reads) — must run per-request, not be prerendered.
export const instant = false;

export default async function TextsPage() {
  const supabase = await createClient();
  // Auth is gated in proxy.ts (middleware) — by the time this page runs,
  // the request has already been redirected to /login if unauthenticated,
  // unless they're in guest mode.
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    const cookieStore = await cookies();
    if (cookieStore.get(GUEST_COOKIE)?.value === "1") return <GuestTextsView />;
    return null;
  }

  const { data: texts } = await supabase
    .from("texts")
    .select("id, title, source, level, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <h1 className="mb-4 font-serif text-xl font-semibold">Texts</h1>
      <AddTextForm />
      <ImportPdfForm />
      <GenerateTextForm />
      <TextList texts={texts ?? []} />
    </main>
  );
}
