"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GrammarSidebar({
  slug,
  title,
  read,
}: {
  slug: string;
  title: string;
  read: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === `/grammar/${slug}`;

  return (
    <Link
      href={`/grammar/${slug}`}
      className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm ${
        active ? "bg-accent/15 font-medium text-accent" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>{title}</span>
      {read && <span className="text-xs text-accent">✓</span>}
    </Link>
  );
}
