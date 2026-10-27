import { cookies } from "next/headers";
import { getUser } from "@/lib/supabase/server";
import { GUEST_COOKIE } from "@/lib/guest";
import DrillView from "./DrillView";
import GuestDrillView from "./GuestDrillView";

// Per-user data (auth + DB reads) — must run per-request, not be prerendered.
export const instant = false;

export default async function DrillPage() {
  // Auth is gated in proxy.ts (middleware) — by the time this page runs,
  // the request has already been redirected to /login if unauthenticated,
  // unless they're in guest mode.
  const { data: userData } = await getUser();
  if (!userData.user) {
    const cookieStore = await cookies();
    if (cookieStore.get(GUEST_COOKIE)?.value === "1") return <GuestDrillView />;
    return null;
  }

  return <DrillView />;
}
