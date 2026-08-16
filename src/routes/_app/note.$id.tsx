import { createFileRoute, Link } from "@tanstack/react-router";
import { NoteEditor } from "@/components/app/note-editor";
import { useNote } from "@/lib/vault/store";

export const Route = createFileRoute("/_app/note/$id")({
  component: NotePage,
});

function NotePage() {
  const { id } = Route.useParams();
  const note = useNote(id);

  if (!note) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="font-serif text-xl font-semibold">Note not found</h1>
        <p className="text-sm text-muted">It may have been deleted from this vault.</p>
        <Link to="/" className="text-sm font-medium text-ink">
          Back to notes
        </Link>
      </main>
    );
  }

  return <NoteEditor note={note} />;
}
