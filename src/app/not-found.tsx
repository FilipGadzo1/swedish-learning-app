import Link from "next/link";
import { buttonVariants } from "@tessera/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="font-serif text-2xl font-semibold">Page not found</h1>
      <p className="font-serif text-muted">
        Den här sidan finns inte — this page doesn&apos;t exist (yet).
      </p>
      <Link href="/texts" className={buttonVariants()}>
        Back to texts
      </Link>
    </main>
  );
}
