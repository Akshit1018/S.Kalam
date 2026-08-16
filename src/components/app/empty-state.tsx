import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-16 text-center", className)}>
      {icon ? <div className="mb-4 text-subtle">{icon}</div> : null}
      <h2 className="font-serif text-lg font-semibold tracking-tight">{title}</h2>
      {body ? <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
