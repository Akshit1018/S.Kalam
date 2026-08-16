import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Plus, X } from "lucide-react";
import { LIBRARY_NAV, PRIMARY_NAV, isNavActive } from "@/lib/vault/nav";
import { useUi } from "@/lib/ui";
import { useVault } from "@/lib/vault/store";
import { extractTasks } from "@/lib/vault/text";
import { cn } from "@/lib/utils";
import { Mark } from "./logo";

export function VaultDrawer() {
  const open = useUi((s) => s.drawerOpen);
  const setOpen = useUi((s) => s.setDrawerOpen);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const notes = useVault((s) => s.notes);
  const vaultName = useVault((s) => s.settings.vaultName);
  const openDaily = useVault((s) => s.openDaily);
  const upsert = useVault((s) => s.upsert);
  const navigate = useNavigate();

  const activeCount = notes.filter((n) => n.status === "active").length;
  const openTasks = extractTasks(notes.filter((n) => n.status === "active")).filter((t) => !t.done).length;

  const goToday = () => {
    const id = openDaily();
    setOpen(false);
    void navigate({ to: "/note/$id", params: { id } });
  };

  const goNew = () => {
    const id = upsert({ title: "Untitled", folder: "inbox", content: "# Untitled\n\n" });
    setOpen(false);
    void navigate({ to: "/note/$id", params: { id } });
  };

  return (
    <div className={cn("lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
      <button
        type="button"
        aria-label="Close vault"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 transition-opacity duration-200 ease-out",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(20.5rem,88vw)] flex-col bg-card shadow-[var(--shadow-border-hover)]",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-start justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
          <div className="min-w-0">
            <Mark className="size-8" />
            <p className="mt-3 font-serif text-xl font-semibold tracking-tight">{vaultName}</p>
            <p className="mt-0.5 text-sm text-muted">
              {activeCount} notes · {openTasks} open
            </p>
          </div>
          <button
            type="button"
            aria-label="Close vault"
            onClick={() => setOpen(false)}
            className="grid size-11 place-items-center rounded-xl text-muted hover:bg-card-2 hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
          <div className="grid grid-cols-2 gap-2 px-1">
            <button
              type="button"
              onClick={goToday}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-medium text-accent-foreground"
            >
              <CalendarDays className="size-4" />
              Today
            </button>
            <button
              type="button"
              onClick={goNew}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-card-2 text-sm font-medium"
            >
              <Plus className="size-4" />
              New
            </button>
          </div>

          <p className="mt-6 mb-1 px-2 text-xs font-medium tracking-wide text-subtle uppercase">Vault</p>
          <nav className="flex flex-col">
            {PRIMARY_NAV.map((item) => {
              const active = isNavActive(pathname, item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium",
                    active ? "bg-card-2 text-foreground" : "text-muted hover:bg-card-2/70 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" strokeWidth={active ? 2.2 : 1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <p className="mt-5 mb-1 px-2 text-xs font-medium tracking-wide text-subtle uppercase">Library</p>
          <nav className="flex flex-col">
            {LIBRARY_NAV.map((item) => {
              const active = isNavActive(pathname, item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium",
                    active ? "bg-card-2 text-foreground" : "text-muted hover:bg-card-2/70 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" strokeWidth={active ? 2.2 : 1.8} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </div>
  );
}

export function DesktopSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const notes = useVault((s) => s.notes);
  const vaultName = useVault((s) => s.settings.vaultName);
  const openDaily = useVault((s) => s.openDaily);
  const upsert = useVault((s) => s.upsert);
  const navigate = useNavigate();
  const activeCount = notes.filter((n) => n.status === "active").length;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-background pt-[max(1.25rem,env(safe-area-inset-top))] pb-5 lg:flex">
      <div className="px-5 pb-5">
        <Mark className="size-7" />
        <p className="mt-3 font-serif text-lg font-semibold tracking-tight">{vaultName}</p>
        <p className="text-xs text-muted">{activeCount} notes in the vault</p>
      </div>
      <div className="flex gap-2 px-3 pb-4">
        <button
          type="button"
          onClick={() => {
            const id = openDaily();
            void navigate({ to: "/note/$id", params: { id } });
          }}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent text-xs font-medium text-accent-foreground"
        >
          <CalendarDays className="size-3.5" />
          Today
        </button>
        <button
          type="button"
          onClick={() => {
            const id = upsert({ title: "Untitled", folder: "inbox", content: "# Untitled\n\n" });
            void navigate({ to: "/note/$id", params: { id } });
          }}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-card-2 text-xs font-medium"
        >
          <Plus className="size-3.5" />
          New
        </button>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-2">
        {[...PRIMARY_NAV, ...LIBRARY_NAV].map((item) => {
          const active = isNavActive(pathname, item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              title={item.hint}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150",
                active ? "bg-card-2 text-foreground" : "text-muted hover:bg-card-2/70 hover:text-foreground",
              )}
            >
              <Icon className="size-4" strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
