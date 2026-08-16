import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { NoteList } from "@/components/app/note-list";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { useVault } from "@/lib/vault/store";
import { sortNotes } from "@/lib/vault/text";

export const Route = createFileRoute("/_app/trash")({
  component: TrashPage,
});

function TrashPage() {
  const notes = useVault((s) => s.notes);
  const emptyTrash = useVault((s) => s.emptyTrash);
  const trashed = useMemo(
    () => sortNotes(notes.filter((n) => n.status === "trashed")),
    [notes],
  );

  return (
    <div>
      <PageHeader
        title="Trash"
        subtitle={trashed.length ? `${trashed.length} pages` : "Nothing waiting"}
        trailing={
          trashed.length ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm("Permanently delete everything in trash?")) {
                  emptyTrash();
                  toast("Trash emptied");
                }
              }}
            >
              Empty
            </Button>
          ) : null
        }
      />
      <div className="px-4 pb-6">
        {trashed.length ? (
          <NoteList notes={trashed} empty="" />
        ) : (
          <EmptyState
            icon={<Trash2 className="size-8" />}
            title="Trash is empty"
            body="Deleted notes sit here until you empty it."
          />
        )}
      </div>
    </div>
  );
}
