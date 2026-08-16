import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, Sparkles } from "lucide-react";
import { runKalam, type AiAction } from "@/lib/ai/server";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useVault } from "@/lib/vault/store";
import type { Note } from "@/lib/vault/types";
import { cn } from "@/lib/utils";

const ACTIONS: { id: AiAction; label: string; hint: string }[] = [
  { id: "continue", label: "Continue", hint: "Write the next lines" },
  { id: "tighten", label: "Tighten", hint: "Clearer, same facts" },
  { id: "title", label: "Title", hint: "A shorter name" },
  { id: "tags", label: "Tags", hint: "Hash suggestions" },
  { id: "next", label: "Next steps", hint: "Three checkboxes" },
];

function useActiveTitles() {
  const notes = useVault((s) => s.notes);
  return useMemo(() => notes.filter((n) => n.status === "active").map((n) => n.title), [notes]);
}

export function AiPanel({
  note,
  content,
  onApply,
  open,
  onOpenChange,
}: {
  note: Note;
  content: string;
  onApply: (next: { title?: string; content?: string; append?: string }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const titles = useActiveTitles();
  const [busy, setBusy] = useState<AiAction | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [pending, setPending] = useState<{ action: AiAction; text: string } | null>(null);

  const run = async (action: AiAction) => {
    setBusy(action);
    setPending(null);
    const result = await runKalam({
      data: { action, title: note.title, content, titles },
    });
    setBusy(null);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    setPending({ action, text: result.text });
    setDraft(result.text);
  };

  const apply = () => {
    if (!pending) return;
    const text = draft.trim();
    if (!text) return;
    if (pending.action === "continue" || pending.action === "next") {
      const glue = content.endsWith("\n") || !content ? "" : "\n\n";
      onApply({ append: `${glue}${text}\n` });
    } else if (pending.action === "tighten") {
      onApply({ content: text });
    } else if (pending.action === "title") {
      onApply({ title: text.replace(/^#+\s*/, "").replace(/^["']|["']$/g, "") });
    } else if (pending.action === "tags") {
      const glue = content.endsWith("\n") || !content ? "" : "\n\n";
      onApply({ append: `${glue}${text}\n` });
    }
    toast("Applied");
    setPending(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Kalam">
      <p className="text-sm text-muted">Suggestions stay on this page until you apply them.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {ACTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={busy !== null}
            onClick={() => void run(item.id)}
            className={cn(
              "rounded-xl bg-card-2 px-3 py-3 text-left disabled:opacity-50",
              busy === item.id && "ring-1 ring-ink",
            )}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              {busy === item.id ? <LoaderCircle className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 text-ink" />}
              {item.label}
            </span>
            <span className="mt-0.5 block text-xs text-muted">{item.hint}</span>
          </button>
        ))}
      </div>

      {pending ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium tracking-wide text-subtle uppercase">Draft</p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-32 w-full resize-none rounded-xl bg-card-2 px-3.5 py-3 font-serif text-sm leading-relaxed outline-none"
          />
          <div className="mt-3 flex gap-2 pb-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setPending(null)}>
              Discard
            </Button>
            <Button type="button" className="flex-1" onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      ) : null}
    </Sheet>
  );
}

export function HomeAsk({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const titles = useActiveTitles();
  const upsert = useVault((s) => s.upsert);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");

  const ask = async () => {
    const q = query.trim();
    if (!q) return;
    setBusy(true);
    const result = await runKalam({ data: { action: "ask", query: q, titles } });
    setBusy(false);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    setAnswer(result.text);
  };

  const save = () => {
    if (!answer.trim()) return;
    const first = answer.split("\n").find((l) => l.replace(/^#+\s*/, "").trim()) ?? "Asked Kalam";
    const title = first.replace(/^#+\s*/, "").slice(0, 72);
    const content = answer.startsWith("#") ? answer : `# ${title}\n\n${answer}\n`;
    upsert({ title, folder: "inbox", content });
    toast("Saved to Inbox");
    setAnswer("");
    setQuery("");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Ask Kalam">
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="A question, a draft, a plan…"
        className="mt-1 min-h-28 w-full resize-none rounded-xl bg-card-2 px-3.5 py-3 text-base leading-relaxed outline-none placeholder:text-subtle"
      />
      <Button type="button" className="mt-3 w-full" disabled={busy || !query.trim()} onClick={() => void ask()}>
        {busy ? "Thinking…" : "Ask"}
      </Button>
      {answer ? (
        <div className="mt-4">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-36 w-full resize-none rounded-xl bg-card-2 px-3.5 py-3 font-serif text-sm leading-relaxed outline-none"
          />
          <Button type="button" className="mt-3 w-full" onClick={save}>
            Save as a note
          </Button>
        </div>
      ) : null}
    </Sheet>
  );
}
