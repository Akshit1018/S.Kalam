import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, Hash, Settings, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Wordmark } from "@/components/app/logo";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useVault } from "@/lib/vault/store";
import { extractTasks } from "@/lib/vault/text";

export const Route = createFileRoute("/_app/more")({
  component: MorePage,
});

function MorePage() {
  const notes = useVault((s) => s.notes);
  const vaultName = useVault((s) => s.settings.vaultName);
  const { user, isPending } = useCurrentUserState();
  const active = notes.filter((n) => n.status === "active").length;
  const archived = notes.filter((n) => n.status === "archived").length;
  const trashed = notes.filter((n) => n.status === "trashed").length;
  const openTasks = extractTasks(notes.filter((n) => n.status === "active")).filter((t) => !t.done).length;

  return (
    <div>
      <PageHeader title="More" subtitle={vaultName} />
      <div className="px-4 pb-8">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Notes" value={active} />
          <Stat label="Open" value={openTasks} />
          <Stat label="Archive" value={archived} />
        </div>

        <ul className="mt-5 flex flex-col gap-2">
          <Row to="/tags" icon={Hash} label="Tags" hint="Hash index" />
          <Row to="/archive" icon={Archive} label="Archive" hint={`${archived} pages`} />
          <Row to="/trash" icon={Trash2} label="Trash" hint={`${trashed} pages`} />
          <Row to="/settings" icon={Settings} label="Settings" hint="Theme, type, vault" />
        </ul>

        <section className="mt-8 rounded-2xl bg-card px-4 py-4 shadow-[var(--shadow-border)]">
          {isPending ? (
            <div className="h-12 animate-pulse rounded-xl bg-card-2" />
          ) : (
            <>
              <SignedIn>
                <p className="text-xs font-medium tracking-wide text-subtle uppercase">Signed in</p>
                <p className="mt-1 font-medium">{user?.displayName ?? user?.primaryEmail ?? "Account"}</p>
                <p className="text-sm text-muted">The vault still lives on this device.</p>
              </SignedIn>
              <SignedOut>
                <p className="font-medium">Optional account</p>
                <p className="mt-1 text-sm text-muted">Notes stay local. Sign in only if you want an identity.</p>
                <Link to="/login" className="mt-3 inline-block text-sm font-medium text-ink">
                  Sign in
                </Link>
              </SignedOut>
            </>
          )}
        </section>

        <div className="mt-10 flex flex-col items-start gap-2 text-muted">
          <Wordmark />
          <p className="max-w-xs text-sm leading-relaxed">
            A private notebook with a pen that can continue a page when you ask.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-card px-3 py-3.5 text-center shadow-[var(--shadow-border)]">
      <div className="font-serif text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs text-subtle">{label}</div>
    </div>
  );
}

function Row({
  to,
  icon: Icon,
  label,
  hint,
}: {
  to: "/tags" | "/archive" | "/trash" | "/settings";
  icon: typeof Hash;
  label: string;
  hint: string;
}) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-3 rounded-2xl bg-card px-3.5 py-3.5 shadow-[var(--shadow-border)]"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-card-2 text-foreground">
          <Icon className="size-5" strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{label}</span>
          <span className="block text-sm text-muted">{hint}</span>
        </span>
      </Link>
    </li>
  );
}
