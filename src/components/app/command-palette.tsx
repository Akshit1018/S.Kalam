import { useEffect, useMemo } from "react";
import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import {
  Archive,
  CalendarDays,
  CheckSquare,
  FolderOpen,
  Hash,
  House,
  Moon,
  NotebookPen,
  Plus,
  Search,
  Settings,
  Sun,
  Trash2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useUi } from "@/lib/ui";
import { useVault } from "@/lib/vault/store";
import { snippet, sortNotes } from "@/lib/vault/text";

export function CommandPalette() {
  const open = useUi((s) => s.paletteOpen);
  const setOpen = useUi((s) => s.setPaletteOpen);
  const setCapture = useUi((s) => s.setCaptureOpen);
  const setAsk = useUi((s) => s.setAskOpen);
  const notes = useVault((s) => s.notes);
  const upsert = useVault((s) => s.upsert);
  const openDaily = useVault((s) => s.openDaily);
  const openWeekly = useVault((s) => s.openWeekly);
  const patchSettings = useVault((s) => s.patchSettings);
  const theme = useVault((s) => s.settings.theme);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const active = useMemo(
    () => sortNotes(notes.filter((n) => n.status === "active")),
    [notes],
  );

  if (!open) return null;

  const go = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[min(18vh,7rem)]">
      <button
        type="button"
        aria-label="Close command palette"
        className="absolute inset-0 bg-foreground/30"
        onClick={() => setOpen(false)}
      />
      <Command
        label="Command palette"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-border-hover)]"
        filter={(value, search) => (value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}
      >
        <div className="flex items-center gap-2 border-b border-border px-3.5">
          <Search className="size-4 shrink-0 text-subtle" />
          <Command.Input
            autoFocus
            placeholder="Search notes or jump…"
            className="h-12 w-full bg-transparent text-base outline-none placeholder:text-subtle"
          />
        </div>
        <Command.List className="max-h-[min(24rem,52dvh)] overflow-y-auto p-1.5">
          <Command.Empty className="px-3 py-8 text-center text-sm text-muted">
            Nothing matches.
          </Command.Empty>

          <Command.Group heading="Actions" className="cmdk-group">
            <Command.Item
              value="new note create"
              className="cmdk-item"
              onSelect={() =>
                go(() => {
                  const id = upsert({ title: "Untitled", folder: "inbox", content: "# Untitled\n\n" });
                  void navigate({ to: "/note/$id", params: { id } });
                })
              }
            >
              <Plus className="size-4" /> New note
            </Command.Item>
            <Command.Item
              value="quick capture"
              className="cmdk-item"
              onSelect={() => go(() => setCapture(true))}
            >
              <Zap className="size-4" /> Quick capture
            </Command.Item>
            <Command.Item
              value="ask kalam ai"
              className="cmdk-item"
              onSelect={() => go(() => setAsk(true))}
            >
              <Sparkles className="size-4" /> Ask Kalam
            </Command.Item>
            <Command.Item
              value="today daily note"
              className="cmdk-item"
              onSelect={() =>
                go(() => {
                  const id = openDaily();
                  void navigate({ to: "/note/$id", params: { id } });
                })
              }
            >
              <CalendarDays className="size-4" /> Open today
            </Command.Item>
            <Command.Item
              value="weekly note this week"
              className="cmdk-item"
              onSelect={() =>
                go(() => {
                  const id = openWeekly();
                  void navigate({ to: "/note/$id", params: { id } });
                })
              }
            >
              <CalendarDays className="size-4" /> Open this week
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Go to" className="cmdk-group">
            <Command.Item value="home" className="cmdk-item" onSelect={() => go(() => void navigate({ to: "/" }))}>
              <House className="size-4" /> Home
            </Command.Item>
            <Command.Item value="browse vault" className="cmdk-item" onSelect={() => go(() => void navigate({ to: "/browse" }))}>
              <FolderOpen className="size-4" /> Browse
            </Command.Item>
            <Command.Item value="tasks" className="cmdk-item" onSelect={() => go(() => void navigate({ to: "/tasks" }))}>
              <CheckSquare className="size-4" /> Tasks
            </Command.Item>
            <Command.Item value="tags" className="cmdk-item" onSelect={() => go(() => void navigate({ to: "/tags", search: {} }))}>
              <Hash className="size-4" /> Tags
            </Command.Item>
            <Command.Item value="archive" className="cmdk-item" onSelect={() => go(() => void navigate({ to: "/archive" }))}>
              <Archive className="size-4" /> Archive
            </Command.Item>
            <Command.Item value="trash" className="cmdk-item" onSelect={() => go(() => void navigate({ to: "/trash" }))}>
              <Trash2 className="size-4" /> Trash
            </Command.Item>
            <Command.Item value="settings" className="cmdk-item" onSelect={() => go(() => void navigate({ to: "/settings" }))}>
              <Settings className="size-4" /> Settings
            </Command.Item>
            <Command.Item
              value="toggle theme dark light"
              className="cmdk-item"
              onSelect={() => go(() => patchSettings({ theme: theme === "dark" ? "light" : "dark" }))}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              Toggle theme
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Notes" className="cmdk-group">
            {active.slice(0, 12).map((note) => (
              <Command.Item
                key={note.id}
                value={`${note.title} ${snippet(note.content, 80)}`}
                className="cmdk-item"
                onSelect={() => go(() => void navigate({ to: "/note/$id", params: { id: note.id } }))}
              >
                <NotebookPen className="size-4 shrink-0" />
                <span className="min-w-0 truncate">{note.title}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
