"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * grammar/layout.tsx computes which lessons are "read" once per layout mount
 * and doesn't re-fetch when navigating between sibling lesson pages (that's
 * normal Next.js layout behavior) — so the sidebar's tick marks go stale
 * even though grammar/[slug]/page.tsx already marked the lesson read
 * server-side before this renders. One refresh per newly-visited slug
 * re-fetches the whole route segment (layout included) with fresh data.
 */
export default function RefreshOnLessonView({ slug }: { slug: string }) {
  const router = useRouter();
  const lastRefreshed = useRef<string | null>(null);

  useEffect(() => {
    if (lastRefreshed.current === slug) return;
    lastRefreshed.current = slug;
    router.refresh();
  }, [slug, router]);

  return null;
}
