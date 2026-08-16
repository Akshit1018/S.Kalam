import type { Note } from "@/lib/vault/types";
import { NoteCard } from "./note-card";

export function NoteList({
  notes,
  empty,
  activeId,
}: {
  notes: Note[];
  empty: string;
  activeId?: string;
}) {
  if (notes.length === 0) {
    return <p className="px-1 py-10 text-center text-sm text-muted">{empty}</p>;
  }
  return (
    <ul className="flex flex-col gap-2.5">
      {notes.map((note) => (
        <li key={note.id}>
          <NoteCard note={note} active={note.id === activeId} />
        </li>
      ))}
    </ul>
  );
}
