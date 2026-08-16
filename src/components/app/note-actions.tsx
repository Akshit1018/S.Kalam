import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FOLDER_META, type FolderId, type Note } from "@/lib/vault/types";
import { useVault } from "@/lib/vault/store";

const FOLDERS = Object.keys(FOLDER_META) as FolderId[];

export function NoteActions({
  note,
  open,
  onOpenChange,
}: {
  note: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const togglePin = useVault((s) => s.togglePin);
  const setStatus = useVault((s) => s.setStatus);
  const updateNote = useVault((s) => s.updateNote);
  const upsert = useVault((s) => s.upsert);
  const removeForever = useVault((s) => s.removeForever);
  const [moving, setMoving] = useState(false);

  const close = () => {
    setMoving(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())} title={note.title}>
      {moving ? (
        <div className="flex flex-col gap-1.5 pb-4">
          <p className="mb-1 text-sm text-muted">Move to folder</p>
          {FOLDERS.map((folder) => (
            <button
              key={folder}
              type="button"
              className="flex h-12 items-center justify-between rounded-xl bg-card-2 px-4 text-left text-sm font-medium"
              onClick={() => {
                updateNote(note.id, { folder });
                toast(`Moved to ${FOLDER_META[folder].label}`);
                close();
              }}
            >
              {FOLDER_META[folder].label}
              {note.folder === folder ? <span className="text-xs text-ink">Current</span> : null}
            </button>
          ))}
          <Button type="button" variant="ghost" className="mt-2" onClick={() => setMoving(false)}>
            Back
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 pb-4">
          <Action
            label={note.pinned ? "Unpin" : "Pin"}
            onClick={() => {
              togglePin(note.id);
              toast(note.pinned ? "Unpinned" : "Pinned");
              close();
            }}
          />
          <Action label="Move to folder" onClick={() => setMoving(true)} />
          <Action
            label="Duplicate"
            onClick={() => {
              const id = upsert({
                title: `${note.title} copy`,
                content: note.content,
                folder: note.folder,
              });
              close();
              void navigate({ to: "/note/$id", params: { id } });
            }}
          />
          {note.status === "active" ? (
            <Action
              label="Archive"
              onClick={() => {
                setStatus(note.id, "archived");
                toast("Archived");
                close();
                void navigate({ to: "/" });
              }}
            />
          ) : null}
          {note.status === "archived" ? (
            <Action
              label="Unarchive"
              onClick={() => {
                setStatus(note.id, "active");
                toast("Restored from archive");
                close();
              }}
            />
          ) : null}
          {note.status !== "trashed" ? (
            <Action
              label="Move to trash"
              danger
              onClick={() => {
                setStatus(note.id, "trashed");
                toast("Moved to trash");
                close();
                void navigate({ to: "/" });
              }}
            />
          ) : (
            <>
              <Action
                label="Restore"
                onClick={() => {
                  setStatus(note.id, "active");
                  toast("Restored");
                  close();
                }}
              />
              <Action
                label="Delete forever"
                danger
                onClick={() => {
                  removeForever(note.id);
                  toast("Deleted");
                  close();
                  void navigate({ to: "/trash" });
                }}
              />
            </>
          )}
        </div>
      )}
    </Sheet>
  );
}

function Action({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 items-center rounded-xl px-4 text-left text-sm font-medium ${
        danger ? "bg-destructive/10 text-destructive" : "bg-card-2 text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
