import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Archive } from "lucide-react";
import { NoteList } from "@/components/app/note-list";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { useVault } from "@/lib/vault/store";
import { sortNotes } from "@/lib/vault/text";

export const Route = createFileRoute("/_app/archive")({
  component: ArchivePage,
});

function ArchivePage() {
  const notes = useVault((s) => s.notes);
  const archived = useMemo(
    () => sortNotes(notes.filter((n) => n.status === "archived")),
    [notes],
  );

  return (
    <div>
      <PageHeader title="Archive" subtitle="Out of the way, not gone" />
      <div className="px-4 pb-6">
        {archived.length ? (
          <NoteList notes={archived} empty="" />
        ) : (
          <EmptyState
            icon={<Archive className="size-8" />}
            title="Archive is empty"
            body="Park finished pages here. They stay searchable from Search."
          />
        )}
      </div>
    </div>
  );
}
