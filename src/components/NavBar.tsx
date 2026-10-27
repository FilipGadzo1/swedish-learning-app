import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { Badge } from "@tessera/ui";
import { getUser } from "@/lib/supabase/server";
import { GUEST_COOKIE } from "@/lib/guest";
import SignOutButton from "./SignOutButton";
import NavLinks from "./NavLinks";
import ThemeToggle from "./ThemeToggle";
import BackButton from "./BackButton";
import AccountMenu from "./AccountMenu";
import BottomTabs from "./BottomTabs";

export default async function NavBar() {
  const { data } = await getUser();
  const user = data.user;
  const cookieStore = await cookies();
  const isGuest = !user && cookieStore.get(GUEST_COOKIE)?.value === "1";

  return (
    <>
      <nav className="flex shrink-0 items-center justify-between gap-2 border-b border-hairline px-3 py-3 text-xs sm:px-4 sm:text-sm">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <BackButton />
          <Link href="/texts" className="flex shrink-0 items-center gap-1.5 font-semibold">
            <Image src="/svenska_logo.png" alt="" width={24} height={24} />
            Svenska
          </Link>
          {/* Nav links move to the bottom tab bar on mobile — sm:contents keeps
              them as direct flex items here (preserving the gap spacing above)
              without the wrapper affecting layout, so only `hidden` has to flip. */}
          <div className="hidden sm:contents">
            <NavLinks />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {/* Desktop: full account controls inline, unchanged from before. */}
          <div className="hidden items-center gap-2 sm:flex sm:gap-3">
            {user ? (
              <>
                <span className="max-w-[12rem] truncate text-muted-foreground">
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
          {/* Mobile: collapsed into a single account icon that opens the same
              controls in a dropdown. */}
          <div className="sm:hidden">
            <AccountMenu userEmail={user?.email ?? null} isGuest={isGuest} />
          </div>
        </div>
      </nav>
      <BottomTabs />
    </>
  );
}
