import { cookies } from "next/headers";
import { createClient, getUser } from "@/lib/supabase/server";
import { GUEST_COOKIE } from "@/lib/guest";
import { GRAMMAR_LESSONS } from "@/lib/grammarLessons";
import GrammarSidebar from "./GrammarSidebar";
import GuestGrammarShell from "./GuestGrammarShell";

// Per-user data (auth + DB reads) — must run per-request, not be prerendered.
export const instant = false;

export default async function GrammarLayout({ children }: { children: React.ReactNode }) {
  // Auth is gated in proxy.ts (middleware) — by the time this layout runs,
  // the request has already been redirected to /login if unauthenticated,
  // unless they're in guest mode.
  const { data: userData } = await getUser();
  if (!userData.user) {
    const cookieStore = await cookies();
    if (cookieStore.get(GUEST_COOKIE)?.value === "1") {
      return (
        <GuestGrammarShell lessons={GRAMMAR_LESSONS.map((l) => ({ slug: l.slug, title: l.title }))}>
          {children}
        </GuestGrammarShell>
      );
    }
    return null;
  }

  const supabase = await createClient();
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status")
    .eq("profile_id", userData.user.id);

  const readSlugs = new Set(
    (progress ?? []).filter((p) => p.status === "read").map((p) => p.lesson_id),
  );

  return (
    <div className="flex flex-1 flex-col md:min-h-0 md:flex-row">
      <aside className="w-full shrink-0 border-b border-hairline bg-surface p-4 md:w-64 md:overflow-y-auto md:border-b-0 md:border-r">
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Grammar</p>
        <nav className="flex flex-col gap-1">
          {GRAMMAR_LESSONS.map((lesson) => (
            <GrammarSidebar
              key={lesson.slug}
              slug={lesson.slug}
              title={lesson.title}
              read={readSlugs.has(lesson.slug)}
            />
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col md:overflow-y-auto">{children}</div>
    </div>
  );
}
