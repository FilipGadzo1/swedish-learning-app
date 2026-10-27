import { cookies } from "next/headers";
import { createClient, getUser } from "@/lib/supabase/server";
import { GUEST_COOKIE } from "@/lib/guest";
import GuestTextsView from "./GuestTextsView";
import TextList from "./TextList";
import TextActions from "./TextActions";

// Per-user data (auth + DB reads) — must run per-request, not be prerendered.
export const instant = false;

export default async function TextsPage() {
  // Auth is gated in proxy.ts (middleware) — by the time this page runs,
  // the request has already been redirected to /login if unauthenticated,
  // unless they're in guest mode.
  const { data: userData } = await getUser();
  if (!userData.user) {
    const cookieStore = await cookies();
    if (cookieStore.get(GUEST_COOKIE)?.value === "1") return <GuestTextsView />;
    return null;
  }

  const supabase = await createClient();
  const { data: texts } = await supabase
    .from("texts")
    .select("id, title, source, level, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      <h1 className="mb-4 font-serif text-xl font-semibold">Texts</h1>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="order-1 md:order-2">
          <TextActions />
        </div>
        <hr className="order-2 my-2 border-0 border-t border-hairline md:hidden" />
        <div className="order-3 md:order-1">
          <TextList texts={texts ?? []} />
        </div>
      </div>
    </main>
  );
}
