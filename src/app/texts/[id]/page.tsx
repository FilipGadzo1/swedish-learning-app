import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient, getUser } from "@/lib/supabase/server";
import { GUEST_COOKIE } from "@/lib/guest";
import ReaderView from "./ReaderView";
import GuestTextPage from "./GuestTextPage";

// Per-user data (auth + DB reads) — must run per-request, not be prerendered.
export const instant = false;

export default async function TextPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Auth is gated in proxy.ts (middleware) — by the time this page runs,
  // the request has already been redirected to /login if unauthenticated,
  // unless they're in guest mode.
  const { data: userData } = await getUser();
  if (!userData.user) {
    const cookieStore = await cookies();
    if (cookieStore.get(GUEST_COOKIE)?.value === "1") return <GuestTextPage id={id} />;
    return null;
  }

  const supabase = await createClient();
  const { data: text } = await supabase
    .from("texts")
    .select("id, title, content, source")
    .eq("id", id)
    .maybeSingle();

  if (!text) {
    notFound();
  }

  return <ReaderView text={text} />;
}
