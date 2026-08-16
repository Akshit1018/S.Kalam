import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { NoteList } from "@/components/app/note-list";
import { PageHeader } from "@/components/app/page-header";
import { FilterChips } from "@/components/app/filter-chips";
import { Button } from "@/components/ui/button";
import { useVault } from "@/lib/vault/store";
import { sortNotes } from "@/lib/vault/text";
import type { FolderId } from "@/lib/vault/types";

export const Route = createFileRoute("/_app/browse")({
  component: BrowsePage,
});

type Filter = "all" | "inbox" | "projects" | "quick" | "weekly";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "inbox", label: "Inbox" },
  { id: "projects", label: "Projects" },
  { id: "quick", label: "Quick" },
  { id: "weekly", label: "Weekly" },
];

function BrowsePage() {
  const notes = useVault((s) => s.notes);
  const upsert = useVault((s) => s.upsert);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const active = notes.filter((n) => n.status === "active" && n.folder !== "daily");
    const scoped = filter === "all" ? active : active.filter((n) => n.folder === filter);
    return sortNotes(scoped);
  }, [notes, filter]);

  const create = (folder: FolderId = "inbox") => {
    const id = upsert({ title: "Untitled", folder, content: "# Untitled\n\n" });
    void navigate({ to: "/note/$id", params: { id } });
  };

  return (
    <div>
      <PageHeader
        title="Browse"
        subtitle={`${visible.length} pages`}
        trailing={
          <Button
            type="button"
            size="icon"
            aria-label="New note"
            onClick={() => create(filter === "all" || filter === "weekly" ? "inbox" : filter)}
          >
            <Plus className="size-5" />
          </Button>
        }
      />
      <FilterChips value={filter} onChange={setFilter} options={FILTERS} />
      <div className="px-4 pb-6">
        <NoteList notes={visible} empty="Nothing in this folder yet." />
      </div>
    </div>
  );
}
