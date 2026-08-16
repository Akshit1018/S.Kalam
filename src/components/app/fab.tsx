import { useNavigate } from "@tanstack/react-router";
import { FolderOpen, MoreHorizontal, Plus, Search, X } from "lucide-react";
import { useUi } from "@/lib/ui";
import { useVault } from "@/lib/vault/store";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { id: "more", label: "More", icon: MoreHorizontal },
  { id: "browse", label: "Browse", icon: FolderOpen },
  { id: "search", label: "Search", icon: Search },
  { id: "new", label: "New", icon: Plus },
] as const;

export function FabMenu() {
  const open = useUi((s) => s.fabOpen);
  const setOpen = useUi((s) => s.setFabOpen);
  const setCapture = useUi((s) => s.setCaptureOpen);
  const upsert = useVault((s) => s.upsert);
  const navigate = useNavigate();

  const run = (id: (typeof ACTIONS)[number]["id"]) => {
    setOpen(false);
    if (id === "new") {
      const noteId = upsert({ title: "Untitled", folder: "inbox", content: "# Untitled\n\n" });
      void navigate({ to: "/note/$id", params: { id: noteId } });
      return;
    }
    if (id === "search") {
      void navigate({ to: "/search", search: {} });
      return;
    }
    if (id === "browse") {
      void navigate({ to: "/browse" });
      return;
    }
    void navigate({ to: "/more" });
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close actions"
        onClick={() => setOpen(false)}
        className={cn(
          "pointer-events-auto absolute inset-0 bg-background/70 transition-opacity duration-200 ease-out",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div className="pointer-events-none absolute right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col items-end gap-2.5">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => run(action.id)}
              className={cn(
                "pointer-events-auto flex items-center gap-3 transition-[opacity,transform] duration-200 ease-out",
                open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
              )}
              style={{ transitionDelay: open ? `${(ACTIONS.length - 1 - i) * 40}ms` : "0ms" }}
            >
              <span className="rounded-full bg-card px-3 py-1.5 text-sm font-medium shadow-[var(--shadow-border)]">
                {action.label}
              </span>
              <span className="grid size-12 place-items-center rounded-full bg-card text-foreground shadow-[var(--shadow-border-hover)]">
                <Icon className="size-5" strokeWidth={1.9} />
              </span>
            </button>
          );
        })}
        <button
          type="button"
          aria-label={open ? "Close actions" : "Open actions"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          onContextMenu={(e) => {
            e.preventDefault();
            setOpen(false);
            setCapture(true);
          }}
          className="pointer-events-auto grid size-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-border-hover)]"
        >
          {open ? <X className="size-6" /> : <Plus className="size-6" />}
        </button>
      </div>
    </div>
  );
}
