"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/texts", label: "Texts" },
  { href: "/vocab", label: "Vocabulary" },
  { href: "/grammar", label: "Grammar" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 ${active ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
