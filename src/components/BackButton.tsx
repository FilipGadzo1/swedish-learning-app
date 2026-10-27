"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function parentPath(pathname: string): string | null {
  if (pathname.startsWith("/texts/")) return "/texts";
  if (pathname.startsWith("/vocab/drill")) return "/vocab";
  if (pathname.startsWith("/grammar/")) return "/grammar";
  return null;
}

export default function BackButton() {
  const pathname = usePathname();
  const parent = parentPath(pathname);
  if (!parent) return null;

  return (
    <Link
      href={parent}
      aria-label="Back"
      className="flex shrink-0 items-center text-muted-foreground hover:text-foreground"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}
