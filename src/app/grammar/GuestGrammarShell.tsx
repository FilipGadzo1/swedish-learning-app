"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { listGuestLessonProgress, markGuestLessonRead } from "@/lib/guest";
import GrammarSidebar from "./GrammarSidebar";

export default function GuestGrammarShell({
  lessons,
  children,
}: {
  lessons: { slug: string; title: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [readSlugs, setReadSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    function sync() {
      const currentSlug = pathname.replace(/^\/grammar\//, "");
      if (lessons.some((l) => l.slug === currentSlug)) {
        markGuestLessonRead(currentSlug);
      }
      setReadSlugs(new Set(Object.keys(listGuestLessonProgress())));
    }
    sync();
  }, [pathname, lessons]);

  return (
    <div className="flex flex-1 flex-col md:min-h-0 md:flex-row">
      <aside className="w-full shrink-0 border-b border-hairline bg-surface p-4 md:w-64 md:overflow-y-auto md:border-b-0 md:border-r">
        <p className="mb-2 text-xs uppercase tracking-wide text-muted">Grammar</p>
        <nav className="flex flex-col gap-1">
          {lessons.map((lesson) => (
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
