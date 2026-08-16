import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NoteList } from "@/components/app/note-list";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { useVault } from "@/lib/vault/store";
import { dailyTitle, weeklyTitle } from "@/lib/vault/seed";
import { sortNotes } from "@/lib/vault/text";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/daily")({
  component: DailyPage,
});

function DailyPage() {
  const notes = useVault((s) => s.notes);
  const openDaily = useVault((s) => s.openDaily);
  const openWeekly = useVault((s) => s.openWeekly);
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(anchor, i)), [anchor]);
  const today = new Date();

  const dailyNotes = useMemo(
    () => sortNotes(notes.filter((n) => n.status === "active" && n.folder === "daily")),
    [notes],
  );

  const hasNote = (date: Date) => notes.some((n) => n.folder === "daily" && n.title === dailyTitle(date) && n.status !== "trashed");

  const openDay = (date: Date) => {
    const id = openDaily(date);
    void navigate({ to: "/note/$id", params: { id } });
  };

  return (
    <div>
      <PageHeader
        title="Daily"
        subtitle={format(today, "EEEE, d MMMM")}
        trailing={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              const id = openWeekly();
              void navigate({ to: "/note/$id", params: { id } });
            }}
          >
            {weeklyTitle(today)}
          </Button>
        }
      />

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Previous week" onClick={() => setAnchor((d) => addDays(d, -7))}>
            <ChevronLeft className="size-5" />
          </Button>
          <p className="text-sm font-medium text-muted">{format(anchor, "d MMM")} – {format(addDays(anchor, 6), "d MMM")}</p>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Next week" onClick={() => setAnchor((d) => addDays(d, 7))}>
            <ChevronRight className="size-5" />
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const selected = isSameDay(day, today);
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => openDay(day)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl py-2.5 text-center",
                  selected ? "bg-accent text-accent-foreground" : "bg-card shadow-[var(--shadow-border)]",
                )}
              >
                <span className={cn("text-[0.65rem] font-medium tracking-wide uppercase", selected ? "opacity-70" : "text-subtle")}>
                  {format(day, "EEEEE")}
                </span>
                <span className="text-sm font-semibold tabular-nums">{format(day, "d")}</span>
                <span className={cn("size-1 rounded-full", hasNote(day) ? selected ? "bg-accent-foreground" : "bg-ink" : "bg-transparent")} />
              </button>
            );
          })}
        </div>

        <Button type="button" className="mt-4 w-full" onClick={() => openDay(today)}>
          Open today
        </Button>
      </div>

      <div className="px-4 pb-6">
        <h2 className="mb-2.5 px-0.5 text-xs font-medium tracking-wide text-subtle uppercase">Recent days</h2>
        <NoteList notes={dailyNotes} empty="Daily pages will appear here as you write them." />
      </div>
    </div>
  );
}
