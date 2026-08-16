import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl bg-card px-3.5 text-[0.95rem] text-foreground shadow-[var(--shadow-border)] outline-none placeholder:text-subtle",
        "focus-visible:shadow-[var(--shadow-border-hover)]",
        className,
      )}
      {...props}
    />
  );
}
