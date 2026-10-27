import { Skeleton } from "@tessera/ui";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <Skeleton className="mb-6 h-7 w-24 bg-hairline" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-full bg-hairline" />
        <Skeleton className="h-9 w-full bg-hairline" />
        <Skeleton className="h-9 w-full bg-hairline" />
        <Skeleton className="h-9 w-full bg-hairline" />
      </div>
    </main>
  );
}
