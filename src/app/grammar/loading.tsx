import { Skeleton } from "@tessera/ui";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <Skeleton className="mb-2 h-8 w-48 bg-hairline" />
      <Skeleton className="mb-6 h-4 w-72 max-w-full bg-hairline" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full bg-hairline" />
        <Skeleton className="h-4 w-full bg-hairline" />
        <Skeleton className="h-4 w-2/3 bg-hairline" />
      </div>
    </main>
  );
}
