import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { useUi } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  subtitle,
  trailing,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  const setDrawer = useUi((s) => s.setDrawerOpen);

  return (
    <header
      className={cn(
        "sticky top-0 z-20 bg-background pt-[max(0.55rem,env(safe-area-inset-top))]",
        className,
      )}
    >
      <div className="flex items-end justify-between gap-3 px-4 pb-3">
        <div className="flex min-w-0 items-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open vault"
            className="lg:hidden"
            onClick={() => setDrawer(true)}
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
          </div>
        </div>
        {trailing ? <div className="flex shrink-0 items-center gap-1.5">{trailing}</div> : null}
      </div>
    </header>
  );
}
