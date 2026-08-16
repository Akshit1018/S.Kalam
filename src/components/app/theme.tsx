import { useEffect } from "react";
import { useVault } from "@/lib/vault/store";

function applyTheme(theme: "system" | "light" | "dark") {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  root.classList.toggle("dark", dark);
  const color = dark ? "#0e1013" : "#f1eee8";
  root.style.backgroundColor = color;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", color);
}

export function ThemeSync() {
  const theme = useVault((s) => s.settings.theme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return null;
}
