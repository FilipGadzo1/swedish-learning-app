"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

function parentPath(pathname: string): string | null {
  if (pathname.startsWith("/texts/")) return "/texts";
  if (pathname.startsWith("/vocab/drill")) return "/vocab";
  // No back button on /grammar/[slug]: unlike texts/vocab, there's no
  // separate grammar list page to return to — "/grammar" just redirects
  // back to the first lesson, and the lesson sidebar is always visible.
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
      <ChevronLeftIcon className="h-4 w-4" />
    </Link>
  );
}
