import { Drawer } from "vaul";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  height = "auto",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  height?: "auto" | "full";
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-foreground/25" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-card outline-none",
            "pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-border-hover)]",
            height === "full" ? "h-[92dvh]" : "max-h-[88dvh]",
          )}
        >
          <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-border-strong" />
          {title ? (
            <Drawer.Title className="px-5 pt-4 text-base font-semibold tracking-tight">
              {title}
            </Drawer.Title>
          ) : (
            <Drawer.Title className="sr-only">Sheet</Drawer.Title>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-3">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
