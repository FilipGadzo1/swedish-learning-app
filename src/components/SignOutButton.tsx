"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
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
    <button onClick={signOut} className="text-muted hover:text-foreground">
      {label}
    </button>
  );
}
