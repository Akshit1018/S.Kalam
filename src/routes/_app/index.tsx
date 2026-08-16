import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowUpRight, Command, Menu, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { NoteList } from "@/components/app/note-list";
import { Button } from "@/components/ui/button";
import { useUi } from "@/lib/ui";
import { runKalam } from "@/lib/ai/server";
import { localHints } from "@/lib/ai/local";
import { useVault } from "@/lib/vault/store";
import { dailyTitle } from "@/lib/vault/seed";
import { countOpenTasks, snippet, sortNotes } from "@/lib/vault/text";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function greeting(now: Date) {
  const hour = now.getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function HomePage() {
  const notes = useVault((s) => s.notes);
  const lastOpenedId = useVault((s) => s.settings.lastOpenedId);
  const vaultName = useVault((s) => s.settings.vaultName);
  const updateNote = useVault((s) => s.updateNote);
  const setDrawer = useUi((s) => s.setDrawerOpen);
  const setPalette = useUi((s) => s.setPaletteOpen);
  const setAsk = useUi((s) => s.setAskOpen);
  const navigate = useNavigate();
  const now = new Date();
  const [prompt, setPrompt] = useState<string | null>(null);
  const [promptBusy, setPromptBusy] = useState(false);

  const active = useMemo(() => notes.filter((n) => n.status === "active"), [notes]);
  const todayNote = active.find((n) => n.folder === "daily" && n.title === dailyTitle(now));
  const lastOpened = lastOpenedId ? active.find((n) => n.id === lastOpenedId && n.id !== todayNote?.id) : undefined;
  const pinned = useMemo(
    () => sortNotes(active.filter((n) => n.pinned && n.folder !== "daily")).slice(0, 4),
    [active],
  );
  const recent = useMemo(() => {
    const skip = new Set([todayNote?.id, lastOpened?.id, ...pinned.map((n) => n.id)].filter(Boolean) as string[]);
    return sortNotes(active.filter((n) => n.folder !== "daily" && !skip.has(n.id))).slice(0, 4);
  }, [active, todayNote, lastOpened, pinned]);
  const hints = useMemo(() => localHints(notes, todayNote?.id), [notes, todayNote?.id]);

  const askPrompt = async () => {
    setPromptBusy(true);
    const result = await runKalam({
      data: {
        action: "prompt",
        title: todayNote?.title,
        content: todayNote?.content,
        titles: active.map((n) => n.title),
      },
    });
    setPromptBusy(false);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    setPrompt(result.text);
  };

  const dropPrompt = () => {
    if (!todayNote || !prompt) return;
    const glue = todayNote.content.endsWith("\n") ? "" : "\n";
    updateNote(todayNote.id, { content: `${todayNote.content}${glue}\n${prompt}\n` });
    toast("Added to today");
    setPrompt(null);
    void navigate({ to: "/note/$id", params: { id: todayNote.id } });
  };

  return (
    <div>
      <header className="flex items-center justify-between px-4 pt-[max(0.55rem,env(safe-area-inset-top))] pb-1">
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
        <span className="font-serif text-lg font-semibold tracking-tight lg:hidden">{vaultName}</span>
        <div className="hidden flex-1 lg:block" />
        <div className="flex items-center">
          <Button type="button" variant="ghost" size="icon" aria-label="Ask Kalam" onClick={() => setAsk(true)}>
            <Sparkles className="size-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Command palette" onClick={() => setPalette(true)}>
            <Command className="size-5" />
          </Button>
        </div>
      </header>

      <div className="px-5 pt-4 pb-2">
        <p className="text-sm text-muted">{format(now, "EEEE, d MMMM")}</p>
        <h1 className="mt-1 font-serif text-3xl leading-none font-semibold tracking-tight">{greeting(now)}</h1>
      </div>

      <div className="stagger-in flex flex-col gap-6 px-4 pt-5 pb-8">
        {todayNote ? (
          <button
            type="button"
            onClick={() => void navigate({ to: "/note/$id", params: { id: todayNote.id } })}
            className="rounded-2xl bg-card p-5 text-left shadow-[var(--shadow-border)] transition-transform duration-150 active:scale-[0.99]"
          >
            <p className="text-xs font-medium tracking-wide text-ink uppercase">Today</p>
            <h2 className="mt-1.5 font-serif text-xl font-semibold tracking-tight">{format(now, "EEEE, MMMM d")}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{snippet(todayNote.content, 180)}</p>
            {countOpenTasks(todayNote.content) ? (
              <p className="mt-3 text-xs font-medium text-ink">{countOpenTasks(todayNote.content)} open on this page</p>
            ) : null}
          </button>
        ) : null}

        <section>
          <h2 className="px-0.5 text-xs font-medium tracking-wide text-subtle uppercase">Suggestions</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {hints.map((hint) => (
              <li key={hint.id}>
                <button
                  type="button"
                  onClick={() => hint.noteId && void navigate({ to: "/note/$id", params: { id: hint.noteId } })}
                  className="flex w-full items-start justify-between gap-3 rounded-2xl bg-card px-4 py-3.5 text-left shadow-[var(--shadow-border)]"
                >
                  <div>
                    <p className="text-xs font-medium tracking-wide text-ink uppercase">{hint.label}</p>
                    <p className="mt-0.5 text-sm">{hint.body}</p>
                  </div>
                  <ArrowUpRight className="mt-1 size-4 shrink-0 text-subtle" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 rounded-2xl bg-card px-4 py-3.5 shadow-[var(--shadow-border)]">
            {prompt ? (
              <>
                <p className="font-serif text-sm leading-relaxed">{prompt}</p>
                <div className="mt-3 flex gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setPrompt(null)}>
                    Dismiss
                  </Button>
                  {todayNote ? (
                    <Button type="button" size="sm" onClick={dropPrompt}>
                      Add to today
                    </Button>
                  ) : null}
                </div>
              </>
            ) : (
              <button
                type="button"
                disabled={promptBusy}
                onClick={() => void askPrompt()}
                className="flex w-full items-center gap-2 text-left text-sm font-medium"
              >
                <Sparkles className="size-4 text-ink" />
                {promptBusy ? "Asking the pen…" : "A line for today"}
              </button>
            )}
          </div>
        </section>

        {lastOpened ? (
          <section>
            <SectionLabel to="/browse">Continue</SectionLabel>
            <button
              type="button"
              onClick={() => void navigate({ to: "/note/$id", params: { id: lastOpened.id } })}
              className="mt-2 flex w-full items-start justify-between gap-3 rounded-2xl bg-card px-4 py-3.5 text-left shadow-[var(--shadow-border)]"
            >
              <div className="min-w-0">
                <p className="font-serif text-lg font-semibold tracking-tight">{lastOpened.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted">{snippet(lastOpened.content, 110)}</p>
              </div>
              <ArrowUpRight className="mt-1 size-4 shrink-0 text-subtle" />
            </button>
          </section>
        ) : null}

        {pinned.length ? (
          <section>
            <SectionLabel>Pinned</SectionLabel>
            <div className="mt-2 flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {pinned.map((note) => (
                <Link
                  key={note.id}
                  to="/note/$id"
                  params={{ id: note.id }}
                  className="w-52 shrink-0 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)]"
                >
                  <h3 className="font-serif text-base font-semibold tracking-tight">{note.title}</h3>
                  <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">{snippet(note.content, 90)}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <SectionLabel to="/browse">Recent</SectionLabel>
          <div className="mt-2">
            <NoteList notes={recent} empty="The desk is clear. Capture something." />
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionLabel({ children, to }: { children: string; to?: "/browse" }) {
  if (!to) {
    return <h2 className="px-0.5 text-xs font-medium tracking-wide text-subtle uppercase">{children}</h2>;
  }
  return (
    <div className="flex items-center justify-between px-0.5">
      <h2 className="text-xs font-medium tracking-wide text-subtle uppercase">{children}</h2>
      <Link to={to} className={cn("text-xs font-medium text-muted")}>
        See all
      </Link>
    </div>
  );
}
