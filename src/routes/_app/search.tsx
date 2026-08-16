import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";
import { NoteList } from "@/components/app/note-list";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { useVault } from "@/lib/vault/store";
import { searchNotes, sortNotes } from "@/lib/vault/text";

export const Route = createFileRoute("/_app/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => {
    return typeof s.q === "string" && s.q.length > 0 ? { q: s.q } : {};
  },
  component: SearchPage,
});

function SearchPage() {
  const initial = Route.useSearch().q ?? "";
  const notes = useVault((s) => s.notes);
  const [query, setQuery] = useState(initial);

  const pool = useMemo(() => notes.filter((n) => n.status !== "trashed"), [notes]);
  const results = useMemo(() => sortNotes(searchNotes(pool, query)), [pool, query]);
  const recent = useMemo(() => sortNotes(pool.filter((n) => n.status === "active")).slice(0, 8), [pool]);

  return (
    <div>
      <PageHeader title="Search" subtitle="Titles, bodies, tags" />
      <div className="px-4 pb-4">
        <label className="flex h-12 items-center gap-2.5 rounded-2xl bg-card px-3.5 shadow-[var(--shadow-border)]">
          <SearchIcon className="size-4 shrink-0 text-subtle" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a note"
            className="h-full w-full bg-transparent text-base outline-none placeholder:text-subtle"
          />
        </label>
      </div>
      <div className="px-4 pb-6">
        {query.trim() ? (
          results.length ? (
            <NoteList notes={results} empty="" />
          ) : (
            <EmptyState title="No matches" body={`Nothing in the vault contains “${query.trim()}”.`} />
          )
        ) : (
          <>
            <h2 className="mb-2.5 text-xs font-medium tracking-wide text-subtle uppercase">Recent</h2>
            <NoteList notes={recent} empty="The vault is empty." />
          </>
        )}
      </div>
    </div>
  );
}
