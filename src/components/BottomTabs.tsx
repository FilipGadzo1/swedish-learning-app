"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AcademicCapIcon, BookOpenIcon, RectangleStackIcon } from "@heroicons/react/24/outline";

const TABS = [
  { href: "/texts", label: "Texts", Icon: BookOpenIcon },
  { href: "/vocab", label: "Vocabulary", Icon: RectangleStackIcon },
  { href: "/grammar", label: "Grammar", Icon: AcademicCapIcon },
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-hairline bg-surface sm:hidden">
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
              active ? "text-accent" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
