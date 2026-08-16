import { Link } from "@tanstack/react-router";
import { format, formatDistanceToNowStrict, differenceInDays } from "date-fns";
import { Pin } from "lucide-react";
import { countOpenTasks, noteTags, snippet } from "@/lib/vault/text";
import { FOLDER_META, type Note } from "@/lib/vault/types";
import { cn } from "@/lib/utils";

function relativeTime(ts: number): string {
  const days = Math.abs(differenceInDays(Date.now(), ts));
  if (days >= 21) return format(ts, "d MMM");
  return formatDistanceToNowStrict(ts, { addSuffix: false })
    .replace(" seconds", "s")
    .replace(" second", "s")
    .replace(" minutes", "m")
    .replace(" minute", "m")
    .replace(" hours", "h")
    .replace(" hour", "h")
    .replace(" days", "d")
    .replace(" day", "d");
}

export function NoteCard({ note, active }: { note: Note; active?: boolean }) {
  const tags = noteTags(note).slice(0, 3);
  const open = countOpenTasks(note.content);
  const preview = snippet(note.content);
  const folder = FOLDER_META[note.folder].label;

  return (
    <Link
      to="/note/$id"
      params={{ id: note.id }}
      className={cn(
        "block rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 ease-out active:scale-[0.99]",
        active && "shadow-[var(--shadow-border-hover)] ring-1 ring-ink/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[0.7rem] font-medium tracking-wide text-subtle uppercase">
            {note.pinned ? <Pin className="size-3 text-ink" strokeWidth={2.4} /> : null}
            <span>{folder}</span>
          </div>
          <h3 className="mt-1 font-serif text-[1.15rem] font-semibold leading-snug tracking-tight">
            {note.title || "Untitled"}
          </h3>
        </div>
        <time className="shrink-0 pt-0.5 text-xs tabular-nums text-subtle">
          {relativeTime(note.updatedAt)}
        </time>
      </div>
      {preview ? <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{preview}</p> : null}
      {tags.length || open ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {open ? (
            <span className="rounded-full bg-ink/15 px-2 py-0.5 text-[0.7rem] font-medium text-ink">
              {open} open
            </span>
          ) : null}
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-card-2 px-2 py-0.5 text-[0.7rem] text-muted">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
