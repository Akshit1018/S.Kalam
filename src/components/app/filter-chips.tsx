import { cn } from "@/lib/utils";

export function FilterChips<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "h-9 shrink-0 rounded-full px-3.5 text-sm font-medium transition-colors duration-150",
              active ? "bg-accent text-accent-foreground" : "bg-card-2 text-muted",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
