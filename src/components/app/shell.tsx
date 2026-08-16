import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { CommandPalette } from "./command-palette";
import { FabMenu } from "./fab";
import { HomeAsk } from "./ai-panel";
import { QuickCapture } from "./quick-capture";
import { DesktopSidebar, VaultDrawer } from "./vault-drawer";
import { useUi } from "@/lib/ui";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideChrome = pathname.startsWith("/note/");
  const askOpen = useUi((s) => s.askOpen);
  const setAskOpen = useUi((s) => s.setAskOpen);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {hideChrome ? null : <DesktopSidebar />}
      {hideChrome ? null : <VaultDrawer />}
      <div className={hideChrome ? "" : "lg:pl-60"}>
        <div className={hideChrome ? "" : "pb-28 lg:pb-10"}>
          <div className={hideChrome ? "" : "mx-auto w-full max-w-2xl"}>{children}</div>
        </div>
      </div>
      {hideChrome ? null : <FabMenu />}
      <CommandPalette />
      <QuickCapture />
      <HomeAsk open={askOpen} onOpenChange={setAskOpen} />
      <Toaster
        theme="system"
        position="top-center"
        toastOptions={{
          className: "!bg-card !text-foreground !border-0 !shadow-[var(--shadow-border-hover)] !rounded-xl",
        }}
      />
    </div>
  );
}
