"use client";

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
      <button
        onClick={() => retry()}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-foreground hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
