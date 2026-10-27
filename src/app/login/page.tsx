"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { enterGuestMode } from "@/lib/guest";

export default function LoginPage() {
  const router = useRouter();

  async function signInWithGoogle() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error(error);
      return;
    }
    if (data.url) {
      window.location.href = data.url;
    }
  }

  function continueAsGuest() {
    enterGuestMode();
    router.push("/texts");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="font-serif text-2xl font-semibold">Svenska</h1>
      <p className="max-w-sm text-center text-sm text-muted">
        Sign in to save your progress across devices.
      </p>
      <button
        onClick={signInWithGoogle}
        className="rounded-lg border border-hairline bg-surface px-4 py-2 font-medium hover:border-accent"
      >
        Sign in with Google
      </button>
      <button
        onClick={continueAsGuest}
        className="text-sm text-muted underline hover:text-foreground"
      >
        Continue as guest
      </button>
      <p className="max-w-sm text-center text-xs text-muted">
        Guest data stays only in this browser and is lost if you clear site
        data — it never syncs to an account.
      </p>
    </main>
  );
}
