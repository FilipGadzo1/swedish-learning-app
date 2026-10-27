import Link from "next/link";
import { cookies } from "next/headers";
import { Badge } from "@tessera/ui";
import { createClient } from "@/lib/supabase/server";
import { GUEST_COOKIE } from "@/lib/guest";
import SignOutButton from "./SignOutButton";
import NavLinks from "./NavLinks";
import ThemeToggle from "./ThemeToggle";
import BackButton from "./BackButton";

export default async function NavBar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const cookieStore = await cookies();
  const isGuest = !user && cookieStore.get(GUEST_COOKIE)?.value === "1";

  return (
    <nav className="flex shrink-0 items-center justify-between gap-2 border-b border-hairline px-3 py-3 text-xs sm:px-4 sm:text-sm">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <BackButton />
        <Link href="/texts" className="shrink-0 font-semibold">
          Svenska
        </Link>
        <NavLinks />
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />
        {user ? (
          <>
            <span className="hidden max-w-[12rem] truncate text-muted-foreground sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </>
        ) : isGuest ? (
          <>
            <Badge variant="outline">Guest</Badge>
            <SignOutButton label="Exit guest mode" />
          </>
        ) : (
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
