import type { Note, TaskItem } from "./types";

export function extractTags(content: string): string[] {
  const tags = new Set<string>();
  const re = /(^|[\s(])#([A-Za-z][\w-]{0,32})\b/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content))) {
    tags.add(match[2].toLowerCase());
  }
  return [...tags].sort();
}

export function extractWikiTitles(content: string): string[] {
  const titles = new Set<string>();
  const re = /\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content))) {
    titles.add(match[1].trim());
  }
  return [...titles];
}

export function noteTags(note: Note): string[] {
  return extractTags(`${note.title}\n${note.content}`);
}

export function extractTasks(notes: Note[]): TaskItem[] {
  const items: TaskItem[] = [];
  for (const note of notes) {
    if (note.status === "trashed") continue;
    let index = 0;
    const re = /^(\s*[-*+]\s+)\[([ xX])\]\s+(.*)$/gm;
    let match: RegExpExecArray | null;
    while ((match = re.exec(note.content))) {
      items.push({
        noteId: note.id,
        noteTitle: note.title,
        index,
        text: match[3].trim(),
        done: match[2].toLowerCase() === "x",
      });
      index += 1;
    }
  }
  return items;
}

export function toggleNthTask(content: string, index: number): string {
  let n = 0;
  const re = /^(\s*[-*+]\s+)\[([ xX])\]\s+(.*)$/gm;
  return content.replace(re, (full, pre: string, mark: string, text: string) => {
    if (n++ !== index) return full;
    const next = mark.trim().toLowerCase() === "x" ? " " : "x";
    return `${pre}[${next}] ${text}`;
  });
}

export function snippet(content: string, max = 140): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s*\[!\w+\]\s*/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\[\[[^\]|]+(?:\|([^\]]+))?\]\]/g, (_, alias: string | undefined) => alias ?? "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~#>|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trimEnd()}…`;
}

export function highlightQuery(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(escaped, "ig"), (m) => `«${m}»`);
}

export function searchNotes(notes: Note[], query: string): Note[] {
  const q = query.trim().toLowerCase();
  if (!q) return notes;
  return notes.filter((n) => {
    const hay = `${n.title}\n${n.content}\n${n.folder}`.toLowerCase();
    return hay.includes(q);
  });
}

export function findByTitle(notes: Note[], title: string): Note | undefined {
  const needle = title.trim().toLowerCase();
  return notes.find((n) => n.title.trim().toLowerCase() === needle && n.status !== "trashed");
}

export function countOpenTasks(content: string): number {
  const matches = content.match(/^\s*[-*+]\s+\[\s\]\s+/gm);
  return matches?.length ?? 0;
}

export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

export function extractOutline(content: string): { depth: number; text: string }[] {
  const out: { depth: number; text: string }[] = [];
  for (const line of content.split("\n")) {
    const m = /^(#{1,4})\s+(.+)$/.exec(line);
    if (!m) continue;
    out.push({
      depth: m[1].length,
      text: m[2].replace(/[*_`]+/g, "").trim(),
    });
  }
  return out;
}

export function findBacklinks(notes: Note[], title: string): Note[] {
  const needle = title.trim().toLowerCase();
  if (!needle) return [];
  return notes.filter((n) => {
    if (n.status !== "active") return false;
    if (n.title.trim().toLowerCase() === needle) return false;
    return extractWikiTitles(n.content).some((t) => t.trim().toLowerCase() === needle);
  });
}
