import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient, getUser } from "@/lib/supabase/server";
import { GUEST_COOKIE } from "@/lib/guest";
import { getLesson } from "@/lib/grammarLessons";
import RefreshOnLessonView from "../RefreshOnLessonView";

// Per-user data (auth + DB reads) — must run per-request, not be prerendered.
export const instant = false;

export default async function GrammarLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) {
    notFound();
  }

  // Auth is gated in proxy.ts (middleware) — by the time this page runs,
  // the request has already been redirected to /login if unauthenticated,
  // unless they're in guest mode.
  const { data: userData } = await getUser();
  if (!userData.user) {
    const cookieStore = await cookies();
    // Guest mode marks progress client-side in GuestGrammarShell instead.
    if (cookieStore.get(GUEST_COOKIE)?.value !== "1") return null;
  } else {
    // Lightweight progress tracking — viewing a lesson marks it read, no
    // forced order or gating.
    const supabase = await createClient();
    await supabase.from("lesson_progress").upsert(
      {
        profile_id: userData.user.id,
        lesson_id: lesson.slug,
        status: "read",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id,lesson_id" },
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      {userData.user && <RefreshOnLessonView slug={lesson.slug} />}
      <h1 className="mb-1 font-serif text-2xl font-semibold">{lesson.title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{lesson.summary}</p>
      <div className="font-serif text-base leading-7">{lesson.body}</div>
    </main>
  );
}
