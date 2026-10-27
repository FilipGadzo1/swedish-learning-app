import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refreshes the session cookie if needed. Do not add logic between
  // createServerClient and this call.
  const { data } = await supabase.auth.getUser();

  // Central auth gate: pages don't need their own redirect("/login") calls,
  // which avoids a bad interaction between redirect() and Next's
  // experimental "instant" prerender validator on those routes.
  const protectedPrefixes = ["/texts", "/vocab", "/grammar"];
  const isProtected = protectedPrefixes.some((p) => request.nextUrl.pathname.startsWith(p));
  const isGuest = request.cookies.get("guestMode")?.value === "1";
  if (isProtected && !data.user && !isGuest) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
