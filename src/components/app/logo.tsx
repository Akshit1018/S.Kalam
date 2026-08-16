import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("text-foreground", className)}>
      <path
        d="M16 4.5 21.4 13.2 16 27.5 10.6 13.2 16 4.5Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path d="M12.4 13.2h7.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Mark className="size-7" />
      {compact ? null : (
        <span className="font-serif text-xl font-semibold tracking-tight">Kalam</span>
      )}
    </span>
  );
}
