import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Hash } from "lucide-react";
import { NoteList } from "@/components/app/note-list";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { useVault } from "@/lib/vault/store";
import { noteTags, sortNotes } from "@/lib/vault/text";

export const Route = createFileRoute("/_app/tags")({
  validateSearch: (s: Record<string, unknown>): { tag?: string } => {
    const tag = typeof s.tag === "string" && s.tag.length > 0 ? s.tag : undefined;
    return tag ? { tag } : {};
  },
  component: TagsPage,
});

function TagsPage() {
  const { tag } = Route.useSearch();
  const notes = useVault((s) => s.notes);
  const active = useMemo(() => notes.filter((n) => n.status === "active"), [notes]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const note of active) {
      for (const t of noteTags(note)) {
        map.set(t, (map.get(t) ?? 0) + 1);
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [active]);

  const tagged = useMemo(() => {
    if (!tag) return [];
    return sortNotes(active.filter((n) => noteTags(n).includes(tag.toLowerCase())));
  }, [active, tag]);

  return (
    <div>
      <PageHeader
        title={tag ? `#${tag}` : "Tags"}
        subtitle={tag ? `${tagged.length} notes` : `${counts.length} in use`}
      />
      <div className="px-4 pb-6">
        {tag ? (
          <>
            <Link to="/tags" search={{}} className="mb-4 inline-block text-sm font-medium text-ink">
              All tags
            </Link>
            <NoteList notes={tagged} empty="No notes carry this tag." />
          </>
        ) : counts.length === 0 ? (
          <EmptyState icon={<Hash className="size-8" />} title="No tags yet" body="Add #garden or #work at the end of a note." />
        ) : (
          <ul className="flex flex-col gap-2">
            {counts.map(([name, count]) => (
              <li key={name}>
                <Link
                  to="/tags"
                  search={{ tag: name }}
                  className="flex items-center justify-between rounded-2xl bg-card px-4 py-3.5 shadow-[var(--shadow-border)]"
                >
                  <span className="font-medium text-ink">#{name}</span>
                  <span className="text-sm tabular-nums text-subtle">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
