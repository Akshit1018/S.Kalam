import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Square } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { FilterChips } from "@/components/app/filter-chips";
import { EmptyState } from "@/components/app/empty-state";
import { useVault } from "@/lib/vault/store";
import { extractTasks } from "@/lib/vault/text";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/tasks")({
  component: TasksPage,
});

type Filter = "open" | "done" | "all";

function TasksPage() {
  const notes = useVault((s) => s.notes);
  const toggleTask = useVault((s) => s.toggleTask);
  const [filter, setFilter] = useState<Filter>("open");

  const tasks = useMemo(() => extractTasks(notes.filter((n) => n.status === "active")), [notes]);
  const openCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.length - openCount;

  const visible = tasks.filter((t) => {
    if (filter === "open") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const groups = useMemo(() => {
    const map = new Map<string, typeof visible>();
    for (const task of visible) {
      const list = map.get(task.noteId) ?? [];
      list.push(task);
      map.set(task.noteId, list);
    }
    return [...map.entries()];
  }, [visible]);

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={
          tasks.length
            ? `${openCount} open · ${doneCount} done`
            : "Checkboxes from every note"
        }
      />
      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[
          { id: "open", label: "Open" },
          { id: "done", label: "Done" },
          { id: "all", label: "All" },
        ]}
      />

      {tasks.length ? (
        <div className="mx-4 mb-4 h-1 overflow-hidden rounded-full bg-card-2">
          <div
            className="h-full bg-ink transition-[width] duration-300"
            style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }}
          />
        </div>
      ) : null}

      <div className="px-4 pb-6">
        {groups.length === 0 ? (
          <EmptyState
            title={filter === "done" ? "Nothing checked off yet" : "Inbox zero"}
            body="Add a `- [ ]` line in any note and it will land here."
          />
        ) : (
          <ul className="flex flex-col gap-5">
            {groups.map(([noteId, items]) => (
              <li key={noteId}>
                <Link
                  to="/note/$id"
                  params={{ id: noteId }}
                  className="mb-2 block text-xs font-medium tracking-wide text-subtle uppercase"
                >
                  {items[0]?.noteTitle}
                </Link>
                <ul className="flex flex-col gap-1.5">
                  {items.map((task) => (
                    <li key={`${task.noteId}-${task.index}`}>
                      <div className="flex items-start gap-3 rounded-2xl bg-card px-3.5 py-3 shadow-[var(--shadow-border)]">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={task.done}
                          className="relative mt-0.5 grid size-6 shrink-0 place-items-center rounded-md text-ink after:absolute after:size-10"
                          onClick={() => toggleTask(task.noteId, task.index)}
                        >
                          {task.done ? <Check className="size-4" strokeWidth={2.4} /> : <Square className="size-4" strokeWidth={1.8} />}
                        </button>
                        <p className={cn("min-w-0 flex-1 text-sm leading-relaxed", task.done && "text-muted line-through decoration-subtle")}>
                          {task.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
