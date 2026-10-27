import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { getUser } from "@/lib/supabase/server";
import { GUEST_COOKIE } from "@/lib/guest";
import NavLinks from "./NavLinks";
import SparkleBorder from "./SparkleBorder";
import BackButton from "./BackButton";
import SettingsMenu from "./SettingsMenu";
import BottomTabs from "./BottomTabs";

export default async function NavBar() {
  const { data } = await getUser();
  const user = data.user;
  const cookieStore = await cookies();
  const isGuest = !user && cookieStore.get(GUEST_COOKIE)?.value === "1";

  return (
    <>
      <nav className="relative flex shrink-0 items-center justify-between gap-2 border-b border-hairline px-3 py-3 text-xs sm:px-4 sm:text-sm">
        <SparkleBorder count={24} />
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
          <SettingsMenu userEmail={user?.email ?? null} isGuest={isGuest} />
        </div>
      </nav>
      <BottomTabs />
    </>
  );
}
