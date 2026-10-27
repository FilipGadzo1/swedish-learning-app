// Inverted block (ink on paper) so errors stand out without adding a new accent color.
export default function ErrorMessage({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      role="alert"
      className={`flex items-start gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background ${className}`}
    >
      <span
        aria-hidden
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-background text-xs font-bold text-foreground"
      >
        !
      </span>
      <span>{children}</span>
    </p>
  );
}
