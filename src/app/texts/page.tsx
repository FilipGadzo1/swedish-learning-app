import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { GUEST_COOKIE } from "@/lib/guest";
import AddTextForm from "./AddTextForm";
import ImportPdfForm from "./ImportPdfForm";
import GenerateTextForm from "./GenerateTextForm";
import GuestTextsView from "./GuestTextsView";

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
      <ul className="mt-6 divide-y divide-hairline rounded-lg border border-hairline bg-surface">
        {texts && texts.length > 0 ? (
          texts.map((t) => (
            <li key={t.id} className="flex items-center justify-between px-4 py-3">
              <Link href={`/texts/${t.id}`} className="font-medium hover:text-accent">
                {t.title}
              </Link>
              <span className="text-xs text-muted">
                {t.source}
                {t.level ? ` · ${t.level}` : ""}
              </span>
            </li>
          ))
        ) : (
          <li className="px-4 py-6 text-center text-sm text-muted">
            No texts yet — paste one above to get started.
          </li>
        )}
      </ul>
    </main>
  );
}
