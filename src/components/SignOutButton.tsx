"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@tessera/ui";
import { exitGuestMode } from "@/lib/guest";

export default function SignOutButton({ label = "Sign out" }: { label?: string }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    exitGuestMode();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={signOut}>
      {label}
    </Button>
  );
}
