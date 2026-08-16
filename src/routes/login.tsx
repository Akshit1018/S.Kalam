import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Mark } from "@/components/app/logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="flex min-h-dvh flex-col bg-background px-6 text-foreground">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
        <Mark className="size-12" />
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight">Kalam</h1>
        <p className="mt-2 text-base leading-relaxed text-muted">
          A private notebook. Sign in for an identity, or keep writing on this device.
        </p>

        <div className="mt-8 flex flex-col gap-2.5">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled in this preview.</p>
          )}
        </div>

        <Link
          to="/"
          className="mt-6 text-center text-sm font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          Continue without an account
        </Link>
      </div>
    </main>
  );
}
