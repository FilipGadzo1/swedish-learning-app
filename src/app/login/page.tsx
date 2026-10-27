"use client";

import { Button } from "@tessera/ui";
import { createClient } from "@/lib/supabase/client";
import { enterGuestMode } from "@/lib/guest";

export default function LoginPage() {
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
    // One full load picks up the new cookie server-side; push() + refresh() costs two round trips.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/texts";
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="font-serif text-2xl font-semibold">Svenska</h1>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Sign in to save your progress across devices.
      </p>
      <Button variant="outline" onClick={signInWithGoogle}>
        Sign in with Google
      </Button>
      <Button variant="link" onClick={continueAsGuest}>
        Continue as guest
      </Button>
      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Guest data stays only in this browser and is lost if you clear site
        data — it never syncs to an account.
      </p>
    </main>
  );
}
