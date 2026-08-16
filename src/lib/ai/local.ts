import { countOpenTasks, snippet } from "@/lib/vault/text";
import type { Note } from "@/lib/vault/types";

export type LocalHint = {
  id: string;
  label: string;
  body: string;
  kind: "today" | "task" | "stale" | "link";
  noteId?: string;
};

export function localHints(notes: Note[], todayId?: string): LocalHint[] {
  const active = notes.filter((n) => n.status === "active");
  const hints: LocalHint[] = [];

  const today = todayId ? active.find((n) => n.id === todayId) : undefined;
  if (today) {
    const open = countOpenTasks(today.content);
    if (open) {
      hints.push({
        id: "today-open",
        label: "Today",
        body: `${open} open on today's page`,
        kind: "today",
        noteId: today.id,
      });
    } else if (today.content.trim().split("\n").length < 8) {
      hints.push({
        id: "today-thin",
        label: "Today",
        body: "Today is still thin. Add one line.",
        kind: "today",
        noteId: today.id,
      });
    }
  }

  const openAcross = active
    .map((n) => ({ n, open: countOpenTasks(n.content) }))
    .filter((x) => x.open > 0 && x.n.id !== today?.id)
    .sort((a, b) => b.open - a.open);
  if (openAcross[0]) {
    hints.push({
      id: "task-note",
      label: "Tasks",
      body: `${openAcross[0].open} open in ${openAcross[0].n.title}`,
      kind: "task",
      noteId: openAcross[0].n.id,
    });
  }

  const week = 7 * 24 * 60 * 60 * 1000;
  const stale = active
    .filter((n) => n.pinned && n.folder !== "daily" && Date.now() - n.updatedAt > week)
    .sort((a, b) => a.updatedAt - b.updatedAt)[0];
  if (stale) {
    hints.push({
      id: "stale-pin",
      label: "Pinned",
      body: `${stale.title} has been quiet for a week`,
      kind: "stale",
      noteId: stale.id,
    });
  }

  const recent = active
    .filter((n) => n.folder !== "daily")
    .sort((a, b) => b.updatedAt - a.updatedAt)[0];
  if (recent && snippet(recent.content, 40)) {
    hints.push({
      id: "continue",
      label: "Continue",
      body: `Pick up ${recent.title}`,
      kind: "link",
      noteId: recent.id,
    });
  }

  return hints.slice(0, 3);
}
