import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full bg-card-2 px-2.5 text-[0.7rem] font-medium tracking-wide text-muted",
        className,
      )}
      {...props}
    />
  );
}
