import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bold,
  CheckSquare,
  Columns2,
  Eye,
  Hash,
  Heading2,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListTree,
  MoreHorizontal,
  Pencil,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { MarkdownPreview } from "@/lib/vault/markdown";
import { extractOutline, findBacklinks } from "@/lib/vault/text";
import { FOLDER_META, type EditorMode, type Note } from "@/lib/vault/types";
import { useVault } from "@/lib/vault/store";
import { cn } from "@/lib/utils";
import { NoteActions } from "./note-actions";
import { AiPanel } from "./ai-panel";

const TOOLS = [
  { id: "h2", icon: Heading2, kind: "line", value: "## ", label: "Heading" },
  { id: "bold", icon: Bold, kind: "wrap", before: "**", after: "**", label: "Bold" },
  { id: "italic", icon: Italic, kind: "wrap", before: "*", after: "*", label: "Italic" },
  { id: "task", icon: CheckSquare, kind: "line", value: "- [ ] ", label: "Task" },
  { id: "list", icon: List, kind: "line", value: "- ", label: "List" },
  { id: "wiki", icon: Link2, kind: "wrap", before: "[[", after: "]]", label: "Wiki link" },
  { id: "tag", icon: Hash, kind: "insert", value: "#", label: "Tag" },
  { id: "indent", icon: IndentIncrease, kind: "indent", value: "  ", label: "Indent" },
] as const;

export function NoteEditor({ note }: { note: Note }) {
  const router = useRouter();
  const notes = useVault((s) => s.notes);
  const updateNote = useVault((s) => s.updateNote);
  const toggleTask = useVault((s) => s.toggleTask);
  const patchSettings = useVault((s) => s.patchSettings);
  const settings = useVault((s) => s.settings);
  const isFresh = Date.now() - note.createdAt < 5000 && note.title === "Untitled";
  const [mode, setMode] = useState<EditorMode>(
    isFresh ? "edit" : settings.editorMode === "split" ? "preview" : settings.editorMode,
  );
  const [menu, setMenu] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id, note.title, note.content]);

  useEffect(() => {
    patchSettings({ lastOpenedId: note.id });
  }, [note.id, patchSettings]);

  const outline = useMemo(() => extractOutline(content), [content]);
  const backlinks = useMemo(() => findBacklinks(notes, note.title), [notes, note.title]);
  const fontSize = `${settings.fontSize / 16}rem`;
  const showEditor = mode === "edit" || mode === "split";
  const showPreview = mode === "preview" || mode === "split";

  const write = (next: string) => {
    setContent(next);
    updateNote(note.id, { content: next });
  };

  const applyTool = (tool: (typeof TOOLS)[number]) => {
    const el = area.current;
    if (!el) {
      if (tool.kind === "wrap") write(`${content}${tool.before}text${tool.after}`);
      else if (tool.kind === "line") write(`${content}${content.endsWith("\n") || !content ? "" : "\n"}${tool.value}`);
      else if (tool.kind === "insert") write(`${content}${tool.value}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    let next = content;
    let caret = end;
    if (tool.kind === "wrap") {
      const inner = selected || "text";
      next = content.slice(0, start) + tool.before + inner + tool.after + content.slice(end);
      caret = start + tool.before.length + inner.length;
    } else if (tool.kind === "line") {
      const lineStart = content.lastIndexOf("\n", start - 1) + 1;
      next = content.slice(0, lineStart) + tool.value + content.slice(lineStart);
      caret = end + tool.value.length;
    } else if (tool.kind === "insert") {
      next = content.slice(0, start) + tool.value + content.slice(end);
      caret = start + tool.value.length;
    } else if (tool.kind === "indent") {
      const lineStart = content.lastIndexOf("\n", start - 1) + 1;
      next = content.slice(0, lineStart) + "  " + content.slice(lineStart);
      caret = end + 2;
    }
    write(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-20 flex items-center gap-1 bg-background px-2 pt-[max(0.4rem,env(safe-area-inset-top))] pb-2">
        <Button type="button" variant="ghost" size="icon" aria-label="Back" onClick={() => router.history.back()}>
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium tracking-wide text-subtle uppercase">
            {FOLDER_META[note.folder].label}
            {note.pinned ? " · Pinned" : ""}
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="Ask the pen" onClick={() => setAiOpen(true)}>
          <Sparkles className="size-5" />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Outline" onClick={() => setOutlineOpen(true)}>
          <ListTree className="size-5" />
        </Button>
        <ModeToggle mode={mode} onChange={setMode} />
        <Button type="button" variant="ghost" size="icon" aria-label="Note actions" onClick={() => setMenu(true)}>
          <MoreHorizontal className="size-5" />
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:mx-auto lg:w-full lg:max-w-5xl">
        <input
          value={title}
          onChange={(e) => {
            const next = e.target.value;
            setTitle(next);
            updateNote(note.id, { title: next || "Untitled" });
          }}
          className="w-full bg-transparent font-serif text-2xl font-semibold tracking-tight outline-none placeholder:text-subtle"
          placeholder="Untitled"
        />

        <div
          className={cn(
            "mt-4 min-h-0 flex-1",
            mode === "split" ? "hidden lg:grid lg:grid-cols-2 lg:gap-8" : "flex flex-col",
          )}
        >
          {showEditor ? (
            <textarea
              ref={area}
              value={content}
              onChange={(e) => write(e.target.value)}
              spellCheck
              placeholder="Write in Markdown. [[wiki links]] and #tags work."
              style={{ fontSize }}
              className={cn(
                "editor-area min-h-[48dvh] w-full flex-1 resize-none bg-transparent text-foreground outline-none placeholder:text-subtle",
                mode === "split" && "min-h-[70dvh] pr-2",
              )}
            />
          ) : null}

          {showPreview ? (
            <div className={cn(mode === "split" && "border-l border-border pl-8")} style={{ ["--note-fs" as string]: fontSize }}>
              {content.trim() ? (
                <MarkdownPreview content={content} notes={notes} onToggleTask={(i) => toggleTask(note.id, i)} />
              ) : (
                <p className="text-sm text-muted">This page is empty. Switch to edit to write.</p>
              )}
              {backlinks.length ? (
                <section className="mt-12 border-t border-border pt-6">
                  <h2 className="text-xs font-medium tracking-wide text-subtle uppercase">Linked from</h2>
                  <ul className="mt-3 flex flex-col gap-2">
                    {backlinks.map((n) => (
                      <li key={n.id}>
                        <Link
                          to="/note/$id"
                          params={{ id: n.id }}
                          className="block rounded-xl bg-card px-3.5 py-3 text-sm font-medium shadow-[var(--shadow-border)]"
                        >
                          {n.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>

        {mode === "split" ? (
          <div className="mt-4 lg:hidden" style={{ ["--note-fs" as string]: fontSize }}>
            <MarkdownPreview content={content} notes={notes} onToggleTask={(i) => toggleTask(note.id, i)} />
          </div>
        ) : null}
      </div>

      {showEditor ? (
        <div className="sticky bottom-0 border-t border-border bg-background/95 px-1 py-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-0.5 overflow-x-auto">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button key={tool.id} type="button" variant="ghost" size="icon-sm" aria-label={tool.label} onClick={() => applyTool(tool)}>
                  <Icon className="size-4" />
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      <NoteActions note={note} open={menu} onOpenChange={setMenu} />
      <AiPanel
        note={note}
        content={content}
        open={aiOpen}
        onOpenChange={setAiOpen}
        onApply={({ title: nextTitle, content: nextContent, append }) => {
          if (nextTitle) {
            setTitle(nextTitle);
            updateNote(note.id, { title: nextTitle });
          }
          if (nextContent) write(nextContent);
          if (append) write(content + append);
        }}
      />

      <Sheet open={outlineOpen} onOpenChange={setOutlineOpen} title="Outline">
        {outline.length === 0 ? (
          <p className="py-8 text-sm text-muted">No headings in this note.</p>
        ) : (
          <ul className="flex flex-col gap-1 pb-4">
            {outline.map((item, i) => (
              <li key={`${item.text}-${i}`} className="text-sm" style={{ paddingLeft: (item.depth - 1) * 14 }}>
                <span className="block rounded-lg px-2 py-2">{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: EditorMode; onChange: (m: EditorMode) => void }) {
  return (
    <div className="mr-0.5 flex rounded-xl bg-card-2 p-0.5">
      {(
        [
          { id: "edit", icon: Pencil, label: "Edit" },
          { id: "preview", icon: Eye, label: "Preview" },
          { id: "split", icon: Columns2, label: "Split" },
        ] as const
      ).map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            onClick={() => onChange(item.id)}
            className={cn(
              "grid size-8 place-items-center rounded-lg transition-colors",
              item.id === "split" && "hidden lg:grid",
              mode === item.id ? "bg-card text-foreground shadow-[var(--shadow-border)]" : "text-muted",
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
