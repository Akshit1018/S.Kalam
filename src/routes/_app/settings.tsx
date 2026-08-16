import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useVault } from "@/lib/vault/store";
import type { EditorMode, ThemePref } from "@/lib/vault/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useVault((s) => s.settings);
  const patch = useVault((s) => s.patchSettings);
  const resetDemo = useVault((s) => s.resetDemo);
  const { isPending } = useCurrentUserState();

  return (
    <div>
      <PageHeader title="Settings" subtitle="The pen and the page" />
      <div className="flex flex-col gap-6 px-4 pb-10">
        <Section title="Vault">
          <label className="block">
            <span className="mb-2 block text-sm text-muted">Name</span>
            <input
              value={settings.vaultName}
              onChange={(e) => patch({ vaultName: e.target.value.slice(0, 32) })}
              className="h-11 w-full rounded-xl bg-card-2 px-3.5 text-sm outline-none"
              placeholder="Desk"
            />
          </label>
        </Section>

        <Section title="Appearance">
          <Segmented<ThemePref>
            value={settings.theme}
            onChange={(theme) => patch({ theme })}
            options={[
              { id: "light", label: "Light" },
              { id: "dark", label: "Dark" },
              { id: "system", label: "System" },
            ]}
          />
        </Section>

        <Section title="Editor">
          <Segmented<EditorMode>
            value={settings.editorMode === "split" ? "preview" : settings.editorMode}
            onChange={(editorMode) => patch({ editorMode })}
            options={[
              { id: "preview", label: "Preview" },
              { id: "edit", label: "Edit" },
            ]}
          />
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted">Type size</span>
              <span className="tabular-nums text-subtle">{settings.fontSize}</span>
            </div>
            <input
              type="range"
              min={15}
              max={21}
              value={settings.fontSize}
              onChange={(e) => patch({ fontSize: Number(e.target.value) })}
              className="w-full accent-[var(--zn-ink)]"
            />
          </div>
        </Section>

        <Section title="Daily notes">
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block font-medium">Create today automatically</span>
              <span className="block text-sm text-muted">ISO date pages in Daily</span>
            </span>
            <Switch
              checked={settings.dailyNotes}
              onCheckedChange={(dailyNotes) => patch({ dailyNotes })}
            />
          </label>
        </Section>

        <Section title="Account">
          {isPending ? (
            <div className="h-12 animate-pulse rounded-xl bg-card-2" />
          ) : (
            <>
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <p className="text-sm text-muted">Optional. The vault does not require an account.</p>
                <Button asChild variant="outline" className="mt-3">
                  <Link to="/login">Sign in</Link>
                </Button>
              </SignedOut>
            </>
          )}
        </Section>

        <Section title="Demo data">
          <p className="text-sm leading-relaxed text-muted">
            Notes live in this browser. Resetting restores the sample desk vault.
          </p>
          <Button
            type="button"
            variant="danger"
            className="mt-3"
            onClick={() => {
              if (window.confirm("Replace the current vault with the demo notes?")) {
                resetDemo();
                toast("Demo vault restored");
              }
            }}
          >
            Restore demo notes
          </Button>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-card px-4 py-4 shadow-[var(--shadow-border)]">
      <h2 className="mb-3 text-xs font-medium tracking-wide text-subtle uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className={cn("grid gap-1 rounded-xl bg-card-2 p-1", options.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "h-9 rounded-lg text-sm font-medium transition-colors duration-150",
            value === opt.id ? "bg-card text-foreground shadow-[var(--shadow-border)]" : "text-muted",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
