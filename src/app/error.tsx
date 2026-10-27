"use client";

import { Button } from "@tessera/ui";
import ErrorMessage from "@/components/ErrorMessage";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-serif text-2xl font-semibold">Something went wrong</h1>
      <ErrorMessage className="text-left">
        {error.message || "An unexpected error occurred."}
      </ErrorMessage>
      <Button onClick={() => retry()}>Try again</Button>
    </main>
  );
}
