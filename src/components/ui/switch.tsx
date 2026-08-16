import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Switch({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative h-7 w-11 shrink-0 rounded-full bg-card-2 shadow-[var(--shadow-border)] transition-colors data-[state=checked]:bg-ink",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-1 rounded-full bg-card shadow-sm transition-transform data-[state=checked]:translate-x-5 data-[state=checked]:bg-accent-foreground" />
    </SwitchPrimitive.Root>
  );
}
