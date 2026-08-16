import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useUi } from "@/lib/ui";
import { useVault } from "@/lib/vault/store";
import { runKalam } from "@/lib/ai/server";

export function QuickCapture() {
  const open = useUi((s) => s.captureOpen);
  const setOpen = useUi((s) => s.setCaptureOpen);
  const upsert = useVault((s) => s.upsert);
  const notes = useVault((s) => s.notes);
  const titles = useMemo(
    () => notes.filter((n) => n.status === "active").map((n) => n.title),
    [notes],
  );
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const close = () => {
    setOpen(false);
    setText("");
    setBusy(false);
  };

  const save = (openAfter: boolean, body = text.trim()) => {
    if (!body) return;
    const first = body.split("\n").find((l) => l.replace(/^#+\s*/, "").trim()) ?? "Quick note";
    const title = first.replace(/^#+\s*/, "").slice(0, 72);
    const id = upsert({
      title,
      folder: "quick",
      content: body.includes("\n") || body.startsWith("#") ? body : `${body}\n`,
    });
    toast("Captured to Quick");
    close();
    if (openAfter) {
      void navigate({ to: "/note/$id", params: { id } });
    }
  };

  const expand = async () => {
    if (!text.trim()) return;
    setBusy(true);
    const result = await runKalam({ data: { action: "expand", query: text, titles } });
    setBusy(false);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    setText(result.text);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => (v ? setOpen(true) : close())} title="Quick capture">
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="A line, a list, a thought…"
        className="mt-1 min-h-36 w-full resize-none rounded-xl bg-card-2 px-3.5 py-3 text-base leading-relaxed text-foreground outline-none placeholder:text-subtle"
      />
      <p className="mt-2 text-xs text-subtle">Saved into Quick. Expand turns a scrap into a short note.</p>
      <div className="mt-4 flex flex-wrap gap-2 pb-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={close}>
          Cancel
        </Button>
        <Button type="button" variant="outline" className="flex-1" disabled={!text.trim() || busy} onClick={() => void expand()}>
          {busy ? "Expanding…" : "Expand"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" disabled={!text.trim()} onClick={() => save(true)}>
          Open
        </Button>
        <Button type="button" className="flex-1" disabled={!text.trim()} onClick={() => save(false)}>
          Save
        </Button>
      </div>
    </Sheet>
  );
}
