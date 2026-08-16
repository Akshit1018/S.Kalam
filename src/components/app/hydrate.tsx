import { useEffect, type ReactNode } from "react";
import { useVault } from "@/lib/vault/store";

export function VaultHydrate({ children }: { children: ReactNode }) {
  useEffect(() => {
    useVault.getState().seedIfEmpty();
  }, []);
  return children;
}
