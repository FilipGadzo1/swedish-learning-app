import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";

export async function createClient() {
  // Opts every caller into request-time rendering. supabase-js calls
  // Date.now() internally (session-expiry checks), which Next's prerenderer
  // flags as an unstable value unless the render is explicitly dynamic —
  // centralized here so every page/layout that uses this client is covered,
  // rather than needing the same fix repeated in each one.
  await connection();
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — middleware refreshes the
            // session instead, so this can be safely ignored.
          }
        },
      },
    },
  );
}

// NavBar and every page/layout that needs the current user each used to
// create their own client and call .auth.getUser() independently — that's
// a real network round trip every time (it verifies the JWT against
// Supabase's auth server), so one page load was making 2-4 of these calls
// in sequence. React's cache() memoizes this per request: every caller in
// the same render gets the first call's result instead of re-verifying.
// (Middleware runs in a separate execution context and isn't covered by
// this — it still does its own single getUser() call.)
export const getUser = cache(async () => {
  const supabase = await createClient();
  return supabase.auth.getUser();
});
